import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  transcribeAudioBuffer,
  analyzeImageBuffer,
} from '../src/multimodal.mjs';

test('transcribes audio buffer using whisper output', async () => {
  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'kassist-whisper-')
  );

  const isWindows = process.platform === 'win32';
  const command = path.join(dir, isWindows ? 'whisper.cmd' : 'whisper.sh');

  const fixture = isWindows
    ? [
        '@echo off',
        'set "input=%~1"',
        'set "output=%~dp1"',
        'for %%f in ("%input%") do set "name=%%~nf"',
        'echo transcricao teste> "%output%%name%.txt"',
      ].join('\r\n')
    : [
        '#!/bin/sh',
        'input="$1"',
        'output="$(dirname "$input")"',
        'name="$(basename "$input" .ogg)"',
        'printf "%s\\n" "transcricao teste" > "$output/$name.txt"',
      ].join('\n');

  await fs.writeFile(command, fixture, 'utf8');
  if (!isWindows) await fs.chmod(command, 0o755);

  const previousCommand = process.env.KASSIST_WHISPER_COMMAND;
  const previousDevice = process.env.KASSIST_WHISPER_DEVICE;
  const previousLanguage = process.env.KASSIST_WHISPER_LANGUAGE;

  process.env.KASSIST_WHISPER_COMMAND = command;
  process.env.KASSIST_WHISPER_DEVICE = 'cpu';
  process.env.KASSIST_WHISPER_LANGUAGE = 'pt';

  try {
    const result = await transcribeAudioBuffer(
      Buffer.from('audio'),
      { extension: 'ogg' }
    );

    assert.equal(result.status, 'COMPLETED');
    assert.equal(result.text, 'transcricao teste');
  } finally {
    if (previousCommand === undefined) {
      delete process.env.KASSIST_WHISPER_COMMAND;
    } else {
      process.env.KASSIST_WHISPER_COMMAND = previousCommand;
    }

    if (previousDevice === undefined) {
      delete process.env.KASSIST_WHISPER_DEVICE;
    } else {
      process.env.KASSIST_WHISPER_DEVICE = previousDevice;
    }

    if (previousLanguage === undefined) {
      delete process.env.KASSIST_WHISPER_LANGUAGE;
    } else {
      process.env.KASSIST_WHISPER_LANGUAGE = previousLanguage;
    }

    await fs.rm(dir, {
      recursive: true,
      force: true,
    });
  }
});

test('returns unavailable when whisper command is missing', async () => {
  const previousCommand = process.env.KASSIST_WHISPER_COMMAND;

  process.env.KASSIST_WHISPER_COMMAND =
    'kassist-whisper-command-that-does-not-exist';

  try {
    const result = await transcribeAudioBuffer(
      Buffer.from('audio'),
      { extension: 'ogg' }
    );

    assert.equal(result.status, 'UNAVAILABLE');
    assert.match(
      result.error ?? '',
      /Transcription runtime not found/i
    );
  } finally {
    if (previousCommand === undefined) {
      delete process.env.KASSIST_WHISPER_COMMAND;
    } else {
      process.env.KASSIST_WHISPER_COMMAND = previousCommand;
    }
  }
});

test('analyzes image buffer using local vision endpoint', async () => {
  const originalFetch = global.fetch;
  let capturedBody = null;

  global.fetch = async (url, options) => {
    const parsedUrl = new URL(url);

    if (parsedUrl.pathname === '/api/show') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          capabilities: ['completion', 'vision'],
        }),
      };
    }

    if (parsedUrl.pathname === '/api/chat') {
      capturedBody = JSON.parse(options.body);

      return {
        ok: true,
        status: 200,
        json: async () => ({
          message: {
            content: JSON.stringify({
              description: 'imagem analisada',
              detected_text: null,
              possible_products: [],
              commercial_information: [],
              confidence: 0.95,
              inferred_fields: [],
              confirmed_fields: [],
            }),
          },
        }),
      };
    }

    throw new Error(`Unexpected URL in test: ${url}`);
  };

  try {
    const result = await analyzeImageBuffer(
      Buffer.from('image'),
      {
        model: 'qwen2.5vl:7b',
        baseUrl: 'http://127.0.0.1:11434',
      }
    );

    assert.equal(result.status, 'COMPLETED');
    assert.equal(result.text, 'imagem analisada');

    assert.equal(capturedBody.model, 'qwen2.5vl:7b');
    assert.equal(capturedBody.stream, false);
    assert.equal(capturedBody.think, false);
    assert.equal(
      capturedBody.messages[0].role,
      'user'
    );
    assert.equal(
      capturedBody.messages[0].images.length,
      1
    );
    assert.equal(
      capturedBody.messages[0].images[0],
      Buffer.from('image').toString('base64')
    );
    assert.match(
      capturedBody.messages[0].content,
      /Analise esta imagem para atendimento comercial\./
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('returns unavailable when vision model is missing', async () => {
  const previousVision =
    process.env.KASSIST_LLM_VISION_MODEL;

  const previousModel =
    process.env.KASSIST_LLM_MODEL;

  delete process.env.KASSIST_LLM_VISION_MODEL;
  delete process.env.KASSIST_LLM_MODEL;

  try {
    const result = await analyzeImageBuffer(
      Buffer.from('image'),
      {
        baseUrl: 'http://127.0.0.1:11434',
      }
    );

    assert.equal(result.status, 'UNAVAILABLE');
    assert.equal(result.text, null);
    assert.match(
      result.error ?? '',
      /vision model configured/i
    );
  } finally {
    if (previousVision !== undefined) {
      process.env.KASSIST_LLM_VISION_MODEL = previousVision;
    }

    if (previousModel !== undefined) {
      process.env.KASSIST_LLM_MODEL = previousModel;
    }
  }
});
