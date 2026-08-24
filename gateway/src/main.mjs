import { createHttpServer, connect } from './http.mjs';
import { startAutoReply } from './auto-reply.mjs';
import { getLlmSettings } from './llm-settings.mjs';
import { updateAllLocalModels } from './llm.mjs';

const host = process.env.KASSIST_GATEWAY_HOST ?? '127.0.0.1';
const port = Number(process.env.KASSIST_GATEWAY_PORT ?? 3210);
const server = createHttpServer();
let updateTimer = null;

function scheduleLlmUpdate() {
  if (updateTimer) clearTimeout(updateTimer);
  const settings = getLlmSettings();
  if (!settings.autoUpdateEnabled) return;

  updateTimer = setTimeout(async () => {
    try {
      const result = await updateAllLocalModels();
      console.log(`[KassisT LLM updater] updated=${result.updated.length} failed=${result.failed.length}`);
    } catch (error) {
      console.error('[KassisT LLM updater] update failed:', error instanceof Error ? error.message : error);
    } finally {
      scheduleLlmUpdate();
    }
  }, settings.intervalHours * 60 * 60 * 1000);
}

export function rescheduleLlmUpdate() {
  scheduleLlmUpdate();
}

server.listen(port, host, async () => {
  console.log(`[KassisT WhatsApp Gateway] listening on http://${host}:${port}`);
  startAutoReply();
  scheduleLlmUpdate();
  try {
    await connect();
  } catch (error) {
    console.error(
      '[KassisT WhatsApp Gateway] initial connection failed:',
      error instanceof Error ? error.message : error
    );
  }
});

/** @param {NodeJS.Signals} signal */
function shutdown(signal) {
  if (updateTimer) clearTimeout(updateTimer);
  console.log(`[KassisT WhatsApp Gateway] ${signal}; shutting down.`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
