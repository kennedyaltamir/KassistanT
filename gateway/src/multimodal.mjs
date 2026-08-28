import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function mediaDir() {
  return path.join(process.env.KASSIST_MEDIA_DIR || path.join(os.tmpdir(), 'kassist-media'), 'incoming');
}

function mediaType(message) {
  if (message?.audioMessage) return 'AUDIO';
  if (message?.imageMessage) return 'IMAGE';
  return null;
}

async function writeTempBuffer(buffer, extension) {
  const dir = await fs.mkdtemp(path.join(mediaDir(), 'item-'));
  const filename = `${crypto.randomUUID()}.${extension}`;
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);
  return { dir, filePath };
}

async function cleanup(directory) {
  await fs.rm(directory, { recursive: true, force: true }).catch(() => {});
}

export async function transcribeAudioBuffer(
  buffer,
  {
    extension = 'ogg',
    device = process.env.KASSIST_WHISPER_DEVICE || 'cpu',
    language = process.env.KASSIST_WHISPER_LANGUAGE || 'pt',
  } = {}
) {
  const configuredCommand =
    process.env.KASSIST_WHISPER_COMMAND || 'whisper';

  const configuredPython =
    process.env.KASSIST_WHISPER_PYTHON ||
    'C:\\Users\\Kennedy Oliveira\\AppData\\Local\\Programs\\Python\\Python310\\python.exe';

  const model =
    process.env.KASSIST_WHISPER_MODEL || 'base';

  const temp = await writeTempBuffer(buffer, extension);

  let command = configuredCommand;
  let args = [];

  try {
    const lowerCommand = configuredCommand.toLowerCase();

    const usesWhisperExecutable =
      lowerCommand.endsWith('.exe');

    const usesWindowsScript =
      lowerCommand.endsWith('.cmd') ||
      lowerCommand.endsWith('.bat');

    if (usesWhisperExecutable) {
      command = configuredPython;

      args = [
        '-m',
        'whisper',
        temp.filePath,
        '--model',
        model,
        '--device',
        device,
        '--output_format',
        'txt',
        '--output_dir',
        temp.dir,
      ];
    } else {
      command = configuredCommand;

      args = [
        temp.filePath,
        '--model',
        model,
        '--device',
        device,
        '--output_format',
        'txt',
        '--output_dir',
        temp.dir,
      ];
    }

    if (language) {
      args.push('--language', language);
    }

    await execFileAsync(
      command,
      args,
      {
        timeout: Number(
          process.env.KASSIST_WHISPER_TIMEOUT_MS || 180000
        ),
        windowsHide: true,
        shell: usesWindowsScript,
        maxBuffer: 16 * 1024 * 1024,
        env: {
          ...process.env,
          PYTHONUTF8: '1',
          PYTHONIOENCODING: 'utf-8',
          OMP_NUM_THREADS: process.env.OMP_NUM_THREADS || '1',
          MKL_NUM_THREADS: process.env.MKL_NUM_THREADS || '1',
          OPENBLAS_NUM_THREADS: process.env.OPENBLAS_NUM_THREADS || '1',
        },
      }
    );

    const stem = path.basename(
      temp.filePath,
      path.extname(temp.filePath)
    );

    const outputPath = path.join(
      temp.dir,
      `${stem}.txt`
    );

    const text = (
      await fs.readFile(outputPath, 'utf8')
    ).trim();

    if (!text) {
      throw new Error(
        'Whisper returned an empty transcription'
      );
    }

    return {
      status: 'COMPLETED',
      text,
      confidence: null,
      source: command,
    };
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      error.code === 'ENOENT'
    ) {
      return {
        status: 'UNAVAILABLE',
        text: null,
        confidence: null,
        error: `Transcription runtime not found: ${command}`,
      };
    }

    return {
      status: 'FAILED',
      text: null,
      confidence: null,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  } finally {
    await cleanup(temp.dir);
  }
}
export async function analyzeImageBuffer(buffer, { model, baseUrl } = {}) {
  const url = String(baseUrl || process.env.KASSIST_LLM_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
  const selectedModel = String(model || process.env.KASSIST_LLM_VISION_MODEL || process.env.KASSIST_LLM_MODEL || '').trim();
  if (!selectedModel) return { status: 'UNAVAILABLE', text: null, confidence: null, error: 'No local vision model configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.KASSIST_LLM_VISION_TIMEOUT_MS || 120000));
  try {
    const response = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        stream: false,
        think: false,
        messages: [{
          role: 'user',
          content: 'Analise esta imagem para atendimento. Retorne apenas uma descrição objetiva do que é útil para o atendimento. Não invente detalhes não visíveis. Quando houver incerteza, informe explicitamente.',
          images: [Buffer.from(buffer).toString('base64')]
        }]
      }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return { status: 'FAILED', text: null, confidence: null, error: `Vision model failed (${response.status})` };
    const text = typeof body?.message?.content === 'string' ? body.message.content.trim() : '';
    if (!text) return { status: 'FAILED', text: null, confidence: null, error: 'Vision model returned empty content' };
    return { status: 'COMPLETED', text, confidence: null, source: `${url}/${selectedModel}` };
  } catch (error) {
    return { status: error?.name === 'AbortError' ? 'TIMEOUT' : 'FAILED', text: null, confidence: null, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

export function classifyMultimodalMessage(message) {
  return mediaType(message);
}
