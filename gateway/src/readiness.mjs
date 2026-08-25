/** @param {Record<string, () => unknown | Promise<unknown>>} checks */
export function createReadinessChecker(checks = {}) {
  const entries = Object.entries(checks);

  return async function checkReadiness() {
    /** @type {Record<string, { ok: boolean }>} */
    const results = {};
    let ready = true;

    for (const [name, check] of entries) {
      try {
        const result = await check();
        const ok = result === true || (result && result.ok === true);
        results[name] = ok ? { ok: true } : { ok: false };
        ready = ready && ok;
      } catch {
        results[name] = { ok: false };
        ready = false;
      }
    }

    return { ready, checks: results };
  };
}
