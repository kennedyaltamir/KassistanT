import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @typedef {{ autoUpdateEnabled: boolean, intervalHours: number }} LlmSettings */
/** @typedef {(settings: LlmSettings) => void} LlmSettingsObserver */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'data', 'llm-settings.json');

/** @type {LlmSettings} */
const DEFAULT_SETTINGS = {
  autoUpdateEnabled: false,
  intervalHours: 24,
};

/** @type {LlmSettings | null} */
let persisted = null;
/** @type {LlmSettingsObserver | null} */
let observer = null;

/** @param {Partial<LlmSettings>} value @returns {LlmSettings} */
export function normalizeLlmSettings(value = {}) {
  return {
    autoUpdateEnabled: Boolean(value.autoUpdateEnabled),
    intervalHours: Math.min(168, Math.max(1, Number(value.intervalHours ?? DEFAULT_SETTINGS.intervalHours))),
  };
}

/** @returns {LlmSettings | null} */
function loadPersisted() {
  if (persisted) return persisted;
  try {
    persisted = normalizeLlmSettings(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')));
  } catch {
    persisted = null;
  }
  return persisted;
}

/** @returns {LlmSettings} */
export function getLlmSettings() {
  return normalizeLlmSettings(loadPersisted() ?? DEFAULT_SETTINGS);
}

/** @param {LlmSettingsObserver | null} callback */
export function registerLlmSettingsObserver(callback) {
  observer = typeof callback === 'function' ? callback : null;
}

/** @param {Partial<LlmSettings>} patch */
export function updateLlmSettings(patch = {}) {
  const next = normalizeLlmSettings({ ...getLlmSettings(), ...patch });
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  const tempPath = `${CONFIG_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, CONFIG_PATH);
  persisted = next;
  observer?.(next);
  return next;
}

export function getLlmSettingsPath() {
  return CONFIG_PATH;
}

export { DEFAULT_SETTINGS };
