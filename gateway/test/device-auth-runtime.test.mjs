import test from 'node:test';
import assert from 'node:assert/strict';
import { sign } from 'node:crypto';
import {
  DeviceAuthError,
  DeviceAuthRuntime,
  generateEd25519DeviceKeyPair,
} from '../src/device-auth/runtime.mjs';

function expectAuthError(fn, code) {
  assert.throws(fn, (error) => {
    assert.ok(error instanceof DeviceAuthError);
    assert.equal(error.code, code);
    return true;
  });
}

test('enrollment is one-time and stores only a device public key', () => {
  const runtime = new DeviceAuthRuntime({ clock: () => 1_000 });
  const keys = generateEd25519DeviceKeyPair();
  const enrollment = runtime.startEnrollment({
    storeId: 'store-1',
    deviceId: 'device-1',
    ttlMs: 5_000,
    pairingCode: 'pair-123',
  });

  assert.equal(enrollment.deviceId, 'device-1');
  assert.equal(enrollment.pairingCode, 'pair-123');
  assert.equal(runtime.devices.size, 0);

  const completed = runtime.completeEnrollment({
    enrollmentId: enrollment.enrollmentId,
    pairingCode: 'pair-123',
    publicKey: keys.publicKey,
  });

  assert.deepEqual(completed, {
    enrollmentId: enrollment.enrollmentId,
    deviceId: 'device-1',
    storeId: 'store-1',
    status: 'COMPLETED',
  });
  assert.equal(runtime.devices.get('device-1').publicKey, keys.publicKey);
  assert.equal('pairingCode' in runtime.devices.get('device-1'), false);

  expectAuthError(
    () => runtime.completeEnrollment({
      enrollmentId: enrollment.enrollmentId,
      pairingCode: 'pair-123',
      publicKey: keys.publicKey,
    }),
    'ENROLLMENT_NOT_FOUND',
  );
});

test('Ed25519 challenge response creates an authenticated session context', () => {
  const runtime = new DeviceAuthRuntime({ clock: () => 10_000 });
  const keys = generateEd25519DeviceKeyPair();
  const enrollment = runtime.startEnrollment({
    storeId: 'store-1',
    deviceId: 'device-1',
    ttlMs: 5_000,
    pairingCode: 'pair-123',
  });
  runtime.completeEnrollment({
    enrollmentId: enrollment.enrollmentId,
    pairingCode: 'pair-123',
    publicKey: keys.publicKey,
  });

  const challenge = runtime.createChallenge({
    deviceId: 'device-1',
    sessionId: 'session-1',
    ttlMs: 2_000,
  });
  const signature = sign(
    null,
    Buffer.from(`${challenge.nonce}.${challenge.deviceId}.${challenge.sessionId}`),
    keys.privateKey,
  ).toString('base64');

  const session = runtime.authenticate({ challengeId: challenge.challengeId, signature });
  assert.equal(session.authenticated, true);
  assert.equal(session.deviceId, 'device-1');
  assert.equal(session.sessionId, 'session-1');
  assert.equal(session.authMethod, 'ED25519_CHALLENGE_RESPONSE');

  assert.deepEqual(runtime.getSessionContext('session-1'), {
    sessionId: 'session-1',
    deviceId: 'device-1',
    storeId: 'store-1',
    authenticated: true,
    authenticatedAt: 10_000,
    authMethod: 'ED25519_CHALLENGE_RESPONSE',
  });
});

test('invalid signature fails closed and challenge cannot be replayed', () => {
  const runtime = new DeviceAuthRuntime({ clock: () => 10_000 });
  const keys = generateEd25519DeviceKeyPair();
  const otherKeys = generateEd25519DeviceKeyPair();
  const enrollment = runtime.startEnrollment({
    storeId: 'store-1',
    deviceId: 'device-1',
    ttlMs: 5_000,
    pairingCode: 'pair-123',
  });
  runtime.completeEnrollment({
    enrollmentId: enrollment.enrollmentId,
    pairingCode: 'pair-123',
    publicKey: keys.publicKey,
  });

  const challenge = runtime.createChallenge({
    deviceId: 'device-1',
    sessionId: 'session-1',
    ttlMs: 2_000,
  });
  const invalidSignature = sign(
    null,
    Buffer.from(`${challenge.nonce}.${challenge.deviceId}.${challenge.sessionId}`),
    otherKeys.privateKey,
  ).toString('base64');

  expectAuthError(
    () => runtime.authenticate({ challengeId: challenge.challengeId, signature: invalidSignature }),
    'AUTH_FAILED',
  );
  expectAuthError(
    () => runtime.authenticate({ challengeId: challenge.challengeId, signature: invalidSignature }),
    'CHALLENGE_REPLAY',
  );
});

test('expired enrollment, expired challenge, and revoked devices fail closed', () => {
  let time = 1_000;
  const runtime = new DeviceAuthRuntime({ clock: () => time });
  const keys = generateEd25519DeviceKeyPair();
  const enrollment = runtime.startEnrollment({
    storeId: 'store-1',
    deviceId: 'device-1',
    ttlMs: 100,
    pairingCode: 'pair-123',
  });
  time = 1_101;
  expectAuthError(
    () => runtime.completeEnrollment({
      enrollmentId: enrollment.enrollmentId,
      pairingCode: 'pair-123',
      publicKey: keys.publicKey,
    }),
    'ENROLLMENT_EXPIRED',
  );

  time = 2_000;
  const freshEnrollment = runtime.startEnrollment({
    storeId: 'store-1',
    deviceId: 'device-1',
    ttlMs: 1_000,
    pairingCode: 'pair-456',
  });
  runtime.completeEnrollment({
    enrollmentId: freshEnrollment.enrollmentId,
    pairingCode: 'pair-456',
    publicKey: keys.publicKey,
  });

  const challenge = runtime.createChallenge({ deviceId: 'device-1', sessionId: 'session-2', ttlMs: 100 });
  time = 2_101;
  expectAuthError(
    () => runtime.authenticate({ challengeId: challenge.challengeId, signature: 'bad' }),
    'CHALLENGE_EXPIRED',
  );

  runtime.revokeDevice({ deviceId: 'device-1' });
  expectAuthError(
    () => runtime.createChallenge({ deviceId: 'device-1', sessionId: 'session-3', ttlMs: 100 }),
    'DEVICE_REVOKED',
  );
});
