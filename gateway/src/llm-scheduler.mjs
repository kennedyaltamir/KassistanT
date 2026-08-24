export function createLlmUpdateScheduler({
  getSettings,
  updateAllLocalModels,
  onLog = () => {},
  onError = () => {},
  setTimer = setTimeout,
  clearTimer = clearTimeout,
}) {
  let timer = null;
  let running = false;
  let stopped = false;

  function schedule() {
    if (stopped) return;
    if (timer) clearTimer(timer);
    timer = null;

    const settings = getSettings();
    if (!settings.autoUpdateEnabled) return;

    timer = setTimer(async () => {
      timer = null;
      if (stopped || running) {
        schedule();
        return;
      }
      running = true;
      try {
        const result = await updateAllLocalModels();
        onLog(`updated=${result.updated.length} failed=${result.failed.length}`);
      } catch (error) {
        onError(error instanceof Error ? error.message : String(error));
      } finally {
        running = false;
        schedule();
      }
    }, settings.intervalHours * 60 * 60 * 1000);
  }

  function shutdown() {
    stopped = true;
    if (timer) clearTimer(timer);
    timer = null;
  }

  return {
    schedule,
    shutdown,
    isRunning: () => running,
    hasTimer: () => timer !== null,
  };
}
