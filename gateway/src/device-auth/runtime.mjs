import {
  createHash,
  createPublicKey,
  generateKeyPairSync,
  randomBytes,
  verify,
} from 'node:crypto';

export class DeviceAuthError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'DeviceAuthError';
    this.code = code;
  }
}

/**
 * @param {string} code
 * @param {string} message
 * @returns {never}
 */
function fail(code, message) {
  throw new DeviceAuthError(code, message);
}

/**
 * @param {unknown} value
 * @param {string} field
 */
function assertString(value, field) {
  if (typeof value !== 'string' || value.length === 0) {
    fail('INVALID_INPUT', `${field} is required`);
  }
}

/**
 * @param {string} publicKey
 * @returns {string}
 */
function clonePublicKey(publicKey) {
  if (typeof publicKey !== 'string' || publicKey.length === 0) {
    fail('INVALID_PUBLIC_KEY', 'device public key is required');
  }

  try {
    const key = createPublicKey({
      key: Buffer.from(publicKey, 'base64'),
      format: 'der',
      type: 'spki',
    });
    return key.export({ format: 'der', type: 'spki' }).toString('base64');
  } catch {
    fail('INVALID_PUBLIC_KEY', 'device public key is invalid');
  }
}

/**
 * @param {{ nonce: string, deviceId: string, sessionId: string }} input
 * @returns {Buffer}
 */
function challengeMaterial({ nonce, deviceId, sessionId }) {
  return Buffer.from(`${nonce}.${deviceId}.${sessionId}`, 'utf8');
}

/**
 * @param {() => number} clock
 * @returns {number}
 */
function now(clock) {
  return clock();
}

export function generateEd25519DeviceKeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  return {
    publicKey: publicKey.export({ format: 'der', type: 'spki' }).toString('base64'),
    privateKey,
  };
}

export class DeviceAuthRuntime {
  /**
   * @param {{ clock?: () => number, random?: () => Buffer }} [options]
   */
  constructor({ clock = () => Date.now(), random = () => randomBytes(18) } = {}) {
    this.clock = clock;
    this.random = random;
    this.enrollments = new Map();
    this.devices = new Map();
    this.challenges = new Map();
    this.sessions = new Map();
  }

  /**
   * @param {{ storeId: string, deviceId: string, ttlMs: number, pairingCode?: string }} input
   */
  startEnrollment({ storeId, deviceId, ttlMs, pairingCode = this.random().toString('hex') }) {
    assertString(storeId, 'storeId');
    assertString(deviceId, 'deviceId');
    if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) {
      fail('INVALID_INPUT', 'ttlMs must be a positive safe integer');
    }

    const enrollmentId = this.random().toString('hex');
    const createdAt = now(this.clock);
    const expiresAt = createdAt + ttlMs;
    this.enrollments.set(enrollmentId, {
      enrollmentId,
      storeId,
      deviceId,
      pairingCodeHash: createHash('sha256').update(pairingCode).digest('hex'),
      status: 'PENDING',
      createdAt,
      expiresAt,
      consumed: false,
    });

    return {
      enrollmentId,
      deviceId,
      pairingCode,
      expiresAt,
    };
  }

  /**
   * @param {{ enrollmentId: string, pairingCode: string, publicKey: string }} input
   */
  completeEnrollment({ enrollmentId, pairingCode, publicKey }) {
    assertString(enrollmentId, 'enrollmentId');
    assertString(pairingCode, 'pairingCode');
    assertString(publicKey, 'publicKey');

    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment || enrollment.consumed) {
      fail('ENROLLMENT_NOT_FOUND', 'enrollment is unavailable');
    }
    if (now(this.clock) >= enrollment.expiresAt) {
      enrollment.status = 'EXPIRED';
      enrollment.consumed = true;
      fail('ENROLLMENT_EXPIRED', 'enrollment has expired');
    }

    const pairingCodeHash = createHash('sha256').update(pairingCode).digest('hex');
    if (pairingCodeHash !== enrollment.pairingCodeHash) {
      fail('INVALID_PAIRING_CODE', 'pairing code is invalid');
    }

    const canonicalPublicKey = clonePublicKey(publicKey);
    enrollment.status = 'COMPLETED';
    enrollment.consumed = true;
    this.devices.set(enrollment.deviceId, {
      deviceId: enrollment.deviceId,
      storeId: enrollment.storeId,
      publicKey: canonicalPublicKey,
      status: 'AUTHORIZED',
      enrolledAt: now(this.clock),
    });

    return {
      enrollmentId,
      deviceId: enrollment.deviceId,
      storeId: enrollment.storeId,
      status: 'COMPLETED',
    };
  }

  /**
   * @param {{ deviceId: string }} input
   */
  revokeDevice({ deviceId }) {
    assertString(deviceId, 'deviceId');
    const device = this.devices.get(deviceId);
    if (!device) {
      fail('DEVICE_NOT_FOUND', 'device is unavailable');
    }
    device.status = 'REVOKED';
    for (const session of this.sessions.values()) {
      if (session.deviceId === deviceId) {
        session.status = 'REVOKED';
      }
    }
    return { deviceId, status: 'REVOKED' };
  }

  /**
   * @param {{ deviceId: string, sessionId: string, ttlMs: number }} input
   */
  createChallenge({ deviceId, sessionId, ttlMs }) {
    assertString(deviceId, 'deviceId');
    assertString(sessionId, 'sessionId');
    if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) {
      fail('INVALID_INPUT', 'ttlMs must be a positive safe integer');
    }

    const device = this.devices.get(deviceId);
    if (!device || device.status !== 'AUTHORIZED') {
      fail(device?.status === 'REVOKED' ? 'DEVICE_REVOKED' : 'UNAUTHORIZED_DEVICE', 'device is not authorized');
    }

    const challengeId = this.random().toString('hex');
    const nonce = this.random().toString('hex');
    const createdAt = now(this.clock);
    const expiresAt = createdAt + ttlMs;
    this.challenges.set(challengeId, {
      challengeId,
      nonce,
      deviceId,
      sessionId,
      createdAt,
      expiresAt,
      consumed: false,
    });

    return { challengeId, nonce, deviceId, sessionId, expiresAt };
  }

  /**
   * @param {{ challengeId: string, signature: string }} input
   */
  authenticate({ challengeId, signature }) {
    assertString(challengeId, 'challengeId');
    assertString(signature, 'signature');

    const challenge = this.challenges.get(challengeId);
    if (!challenge || challenge.consumed) {
      fail('CHALLENGE_REPLAY', 'challenge is unavailable');
    }
    challenge.consumed = true;

    if (now(this.clock) >= challenge.expiresAt) {
      fail('CHALLENGE_EXPIRED', 'challenge has expired');
    }

    const device = this.devices.get(challenge.deviceId);
    if (!device || device.status !== 'AUTHORIZED') {
      fail(device?.status === 'REVOKED' ? 'DEVICE_REVOKED' : 'UNAUTHORIZED_DEVICE', 'device is not authorized');
    }

    let valid = false;
    try {
      const publicKey = createPublicKey({
        key: Buffer.from(device.publicKey, 'base64'),
        format: 'der',
        type: 'spki',
      });
      valid = verify(
        null,
        challengeMaterial(challenge),
        publicKey,
        Buffer.from(signature, 'base64'),
      );
    } catch {
      valid = false;
    }

    if (!valid) {
      fail('AUTH_FAILED', 'device authentication failed');
    }

    const authenticatedAt = now(this.clock);
    const session = {
      sessionId: challenge.sessionId,
      deviceId: challenge.deviceId,
      authenticated: true,
      authenticatedAt,
      status: 'READY',
      authMethod: 'ED25519_CHALLENGE_RESPONSE',
    };
    this.sessions.set(session.sessionId, session);
    return { ...session };
  }

  /**
   * @param {string} sessionId
   */
  getSessionContext(sessionId) {
    assertString(sessionId, 'sessionId');
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'READY') {
      fail('UNAUTHENTICATED', 'session is not authenticated');
    }
    const device = this.devices.get(session.deviceId);
    if (!device || device.status !== 'AUTHORIZED') {
      fail(device?.status === 'REVOKED' ? 'DEVICE_REVOKED' : 'UNAUTHORIZED_DEVICE', 'device is not authorized');
    }
    return {
      sessionId: session.sessionId,
      deviceId: session.deviceId,
      storeId: device.storeId,
      authenticated: true,
      authenticatedAt: session.authenticatedAt,
      authMethod: session.authMethod,
    };
  }
}
