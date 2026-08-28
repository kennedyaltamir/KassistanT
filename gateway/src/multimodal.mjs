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
  const root = mediaDir();
  await fs.mkdir(root, { recursive: true });
  const dir = await fs.mkdtemp(path.join(root, 'item-'));
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
        '--language',
        language,
        '--output_dir',
        temp.dir,
        '--output_format',
        'json',
      ];
    } else if (usesWindowsScript) {
      args = [
        temp.filePath,
        '--model',
        model,
        '--device',
        device,
        '--language',
        language,
        '--output_dir',
        temp.dir,
        '--output_format',
        'json',
      ];
    } else {
      args = [
        temp.filePath,
        '--model',
        model,
        '--device',
        device,
        '--language',
        language,
        '--output_dir',
        temp.dir,
        '--output_format',
        'json',
      ];
    }

    const { stdout, stderr } = await execFileAsync(command, args, { timeout: 120000, windowsHide: true });
    const outputPath = path.join(temp.dir, `${path.basename(temp.filePath, path.extname(temp.filePath))}.json`);
    let payload = null;
    try {
      payload = JSON.parse(await fs.readFile(outputPath, 'utf8'));
    } catch {
      payload = null;
    }
    const text = typeof payload?.text === 'string' ? payload.text.trim() : String(stdout ?? '').trim();
    return { status: 'COMPLETED', text, stderr: String(stderr ?? '').trim() };
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    if (code === 'ENOENT') return { status: 'UNAVAILABLE', text: null, error: `Whisper command is unavailable: ${configuredCommand}` };
    return { status: 'FAILED', text: null, error: error instanceof Error ? error.message : String(error) };
  } finally {
    await cleanup(temp.dir);
  }
}

export async function analyzeImageBuffer(buffer, { model = process.env.KASSIST_VISION_MODEL || 'llava:latest', baseUrl = process.env.KASSIST_VISION_BASE_URL || 'http://127.0.0.1:11434' } = {}) {
  const type = mediaType({ imageMessage: true });
  if (type !== 'IMAGE') return { status: 'FAILED', text: null, error: 'Not an image message' };
  const data = Buffer.isBuffer(buffer) ? buffer.toString('base64') : Buffer.from(buffer).toString('base64');
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model, prompt: 'Describe this image accurately. Do not invent details.', images: [data], stream: false }),
    });
    if (!response.ok) return { status: 'UNAVAILABLE', text: null, error: `Vision endpoint returned HTTP ${response.status}` };
    const payload = await response.json();
    return { status: 'COMPLETED', text: typeof payload?.response === 'string' ? payload.response.trim() : null };
  } catch (error) {
    return { status: 'UNAVAILABLE', text: null, error: error instanceof Error ? error.message : String(error) };
  }
}
