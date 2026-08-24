import test from 'node:test';
import assert from 'node:assert/strict';

const { getLlmSettings, updateLlmSettings, DEFAULT_SETTINGS } = await import('../src/llm-settings.mjs?test=settings');

test('LLM settings expose safe defaults', () => {
  const value = getLlmSettings();
  assert.equal(value.autoUpdateEnabled, DEFAULT_SETTINGS.autoUpdateEnabled);
  assert.equal(value.intervalHours, DEFAULT_SETTINGS.intervalHours);
});

test('LLM settings clamp update interval', () => {
  const value = updateLlmSettings({ autoUpdateEnabled: true, intervalHours: 999 });
  assert.equal(value.autoUpdateEnabled, true);
  assert.equal(value.intervalHours, 168);
});

