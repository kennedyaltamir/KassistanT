import path from 'node:path';

export function getDevelopmentMediaRoot(env = process.env, platform = process.platform) {
  if (platform !== 'win32') return null;

  const appData = String(env.APPDATA ?? '').trim();
  if (!appData) return null;

  return path.win32.resolve(appData, 'Electron', 'campaigns', 'images');
}

export function applyDevelopmentRuntimeEnvironment(
  env = process.env,
  platform = process.platform,
  lifecycle = env.npm_lifecycle_event
) {
  if (lifecycle !== 'dev') return env;
  if (String(env.KASSIST_MEDIA_ROOT ?? '').trim()) return env;

  const mediaRoot = getDevelopmentMediaRoot(env, platform);
  if (mediaRoot) env.KASSIST_MEDIA_ROOT = mediaRoot;
  return env;
}

export function isMainEntrypoint(argvPath = process.argv[1], moduleUrl = import.meta.url) {
  if (!argvPath) return false;
  return path.resolve(argvPath) === path.resolve(new URL(moduleUrl).pathname);
}

applyDevelopmentRuntimeEnvironment();

if (isMainEntrypoint()) {
  await startGateway();
}

async function startGateway() {
  const { createHttpServer, connect } = await import('./http.mjs');
  const { attachWssTransport } = await import('./wss.mjs');
  const { startAutoReply } = await import('./auto-reply.mjs');
  const { getLlmSettings, registerLlmSettingsObserver } = await import('./llm-settings.mjs');
  const { updateAllLocalModels } = await import('./llm.mjs');
  const { createLlmUpdateScheduler } = await import('./llm-scheduler.mjs');
  const { shutdown: shutdownWhatsApp } = await import('./whatsapp.mjs');

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
}
