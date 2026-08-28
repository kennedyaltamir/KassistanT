import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getDevelopmentMediaRoot, applyDevelopmentRuntimeEnvironment } from './main.mjs';

test('development media root matches Electron development userData on Windows', () => {
  const root = getDevelopmentMediaRoot(
    { APPDATA: 'C:\\Users\\Example\\AppData\\Roaming' },
    'win32'
  );

  assert.equal(
    root,
    'C:\\Users\\Example\\AppData\\Roaming\\Electron\\campaigns\\images'
  );
});

test('explicit KASSIST_MEDIA_ROOT always wins over development fallback', () => {
  const env = {
    APPDATA: 'C:\\Users\\Example\\AppData\\Roaming',
    KASSIST_MEDIA_ROOT: 'D:\\controlled-media\\images'
  };

  applyDevelopmentRuntimeEnvironment(env, 'win32', 'dev');

  assert.equal(env.KASSIST_MEDIA_ROOT, 'D:\\controlled-media\\images');
});

test('development lifecycle supplies media root when it is absent', () => {
  const env = {
    APPDATA: 'C:\\Users\\Example\\AppData\\Roaming',
    npm_lifecycle_event: 'dev'
  };

  applyDevelopmentRuntimeEnvironment(env, 'win32');

  assert.equal(
    env.KASSIST_MEDIA_ROOT,
    'C:\\Users\\Example\\AppData\\Roaming\\Electron\\campaigns\\images'
  );
});

test('non-development lifecycle does not silently configure media root', () => {
  const env = {
    APPDATA: 'C:\\Users\\Example\\AppData\\Roaming',
    npm_lifecycle_event: 'test'
  };

  applyDevelopmentRuntimeEnvironment(env, 'win32');

  assert.equal(env.KASSIST_MEDIA_ROOT, undefined);
});

test('missing APPDATA leaves development media root unresolved on Windows', () => {
  const env = { npm_lifecycle_event: 'dev' };

  applyDevelopmentRuntimeEnvironment(env, 'win32');

  assert.equal(env.KASSIST_MEDIA_ROOT, undefined);
});

test('Electron startup statically injects its controlled campaign media root', () => {
  const electronMainPath = path.resolve(
    import.meta.dirname,
    '..',
    '..',
    'apps',
    'desktop',
    'electron',
    'main.cjs'
  );
  const source = fs.readFileSync(electronMainPath, 'utf8');

  assert.match(source, /const campaignMediaRoot = path\.join\(app\.getPath\("userData"\), "campaigns", "images"\)/);
  assert.match(source, /KASSIST_MEDIA_ROOT:\s*process\.env\.KASSIST_MEDIA_ROOT \?\? campaignMediaRoot/);
});

test('sendImage retains the controlled-root security boundary', () => {
  const whatsappPath = path.resolve(import.meta.dirname, 'whatsapp.mjs');
  const source = fs.readFileSync(whatsappPath, 'utf8');

  assert.match(source, /if \(!configuredMediaRoot\) throw new Error\('Controlled media transport root is not configured'\)/);
  assert.match(source, /if \(!isInsideRoot\(reference, configuredMediaRoot\)\) throw new Error\('Image reference is outside the authorized media root'\)/);
});
