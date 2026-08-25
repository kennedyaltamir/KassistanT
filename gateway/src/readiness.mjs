/** @typedef {{ ok: boolean }} ReadinessResult */
/** @typedef {Record<string, () => boolean | ReadinessResult | Promise<boolean | ReadinessResult>>} ReadinessChecks */

/** @param {ReadinessChecks} checks */
export function createReadinessChecker(checks = {}) {
  const entries = Object.entries(checks);

  return async function checkReadiness() {
    /** @type {Record<string, ReadinessResult>} */
    const results = {};
    let ready = true;

    for (const [name, check] of entries) {
      try {
        const result = await check();
        const ok = result === true || (typeof result === 'object' && result !== null && result.ok === true);
        results[name] = { ok };
        ready = ready && ok;
      } catch {
        results[name] = { ok: false };
        ready = false;
      }
    }

    return { ready, checks: results };
  };
}
