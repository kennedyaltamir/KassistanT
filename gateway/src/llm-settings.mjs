import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'data', 'llm-settings.json');

const DEFAULT_SETTINGS = {
  autoUpdateEnabled: false,
  intervalHours: 24,
};

let persisted = null;

export function normalizeLlmSettings(value = {}) {
  return {
    autoUpdateEnabled: Boolean(value.autoUpdateEnabled),
    intervalHours: Math.min(168, Math.max(1, Number(value.intervalHours ?? DEFAULT_SETTINGS.intervalHours))),
  };
}

function loadPersisted() {
  if (persisted) return persisted;
  try {
    persisted = normalizeLlmSettings(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')));
  } catch {
    persisted = null;
  }
  return persisted;
}

export function getLlmSettings() {
  return normalizeLlmSettings(loadPersisted() ?? DEFAULT_SETTINGS);
}

export function updateLlmSettings(patch = {}) {
  const next = normalizeLlmSettings({ ...getLlmSettings(), ...patch });
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  const tempPath = `${CONFIG_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, CONFIG_PATH);
  persisted = next;
  return next;
}

export function getLlmSettingsPath() {
  return CONFIG_PATH;
}

export { DEFAULT_SETTINGS };
