import { createHttpServer, connect } from './http.mjs';
import { attachWssTransport } from './wss.mjs';
import { startAutoReply } from './auto-reply.mjs';
import { getLlmSettings, registerLlmSettingsObserver } from './llm-settings.mjs';
import { updateAllLocalModels } from './llm.mjs';
import { createLlmUpdateScheduler } from './llm-scheduler.mjs';
import { shutdown as shutdownWhatsApp } from './whatsapp.mjs';

const host = process.env.KASSIST_GATEWAY_HOST ?? '127.0.0.1';
const port = Number(process.env.KASSIST_GATEWAY_PORT ?? 3210);
const server = createHttpServer();
const wss = attachWssTransport(server);
const scheduler = createLlmUpdateScheduler({
  getSettings: getLlmSettings,
  updateAllLocalModels,
  onLog: (message) => console.log(`[KassisT LLM updater] ${message}`),
  onError: (message) => console.error(`[KassisT LLM updater] update failed: ${message}`),
});

registerLlmSettingsObserver(() => scheduler.schedule());

server.listen(port, host, async () => {
  console.log(`[KassisT WhatsApp Gateway] listening on http://${host}:${port}`);
  startAutoReply();
  scheduler.schedule();
  try {
    await connect();
  } catch (error) {
    console.error(
      '[KassisT WhatsApp Gateway] initial connection failed:',
      error instanceof Error ? error.message : error
    );
  }
});

let shuttingDown = false;

/** @param {NodeJS.Signals} signal */
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  wss.close();
  scheduler.shutdown();
  console.log(`[KassisT WhatsApp Gateway] ${signal}; shutting down.`);
  await shutdownWhatsApp();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
