/** @typedef {{ autoUpdateEnabled: boolean, intervalHours: number }} LlmSettings */
/** @typedef {{ updated: unknown[], failed: unknown[] }} UpdateResult */
/** @typedef {() => LlmSettings} GetSettings */
/** @typedef {() => Promise<UpdateResult>} UpdateAllLocalModels */
/** @typedef {(message: string) => void} LogHandler */
/** @typedef {(callback: () => void | Promise<void>, delay: number) => ReturnType<typeof setTimeout>} SetTimer */
/** @typedef {(timer: ReturnType<typeof setTimeout>) => void} ClearTimer */

/** @param {{ getSettings: GetSettings, updateAllLocalModels: UpdateAllLocalModels, onLog?: LogHandler, onError?: LogHandler, setTimer?: SetTimer, clearTimer?: ClearTimer }} options */
export function createLlmUpdateScheduler({
  getSettings,
  updateAllLocalModels,
  onLog = () => {},
  onError = () => {},
  setTimer = setTimeout,
  clearTimer = clearTimeout,
}) {
  /** @type {ReturnType<typeof setTimeout> | null} */
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
