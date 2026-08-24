import { createHttpServer, connect } from './http.mjs';

const host = process.env.KASSIST_GATEWAY_HOST ?? '127.0.0.1';
const port = Number(process.env.KASSIST_GATEWAY_PORT ?? 3210);
const server = createHttpServer();

server.listen(port, host, async () => {
  console.log(`[KassisT WhatsApp Gateway] listening on http://${host}:${port}`);
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
  console.log(`[KassisT WhatsApp Gateway] ${signal}; shutting down.`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
