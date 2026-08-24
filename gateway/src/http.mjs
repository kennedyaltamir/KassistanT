import { createServer } from 'node:http';
import { connect, getMessages, getStatus, logout, resetSession, sendText, subscribe } from './whatsapp.mjs';

/** @param {import('node:http').ServerResponse} response @param {number} statusCode @param {unknown} payload */
function json(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  response.end(body);
}

/** @param {import('node:http').IncomingMessage} request @returns {Promise<Record<string, unknown>>} */
function parseBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.setEncoding('utf8');
    request.on('data', (/** @type {string} */ chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Request body too large'));
        request.destroy();
      }
    });
    request.on('end', () => {
      if (!raw) return resolve({});
      try {
        /** @type {unknown} */
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          return resolve(/** @type {Record<string, unknown>} */ (parsed));
        }
        return resolve({});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    request.on('error', reject);
  });
}

/** @param {import('node:http').ServerResponse} response @param {{ type: string, [key: string]: unknown }} event */
function writeSse(response, event) {
  response.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}

export function createHttpServer() {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');

    if (request.method === 'GET' && url.pathname === '/health') {
      return json(response, 200, { ok: true, service: 'kassist-whatsapp-gateway' });
    }

    if (request.method === 'GET' && url.pathname === '/api/whatsapp/status') {
      return json(response, 200, getStatus());
    }

    if (request.method === 'GET' && url.pathname === '/api/whatsapp/messages') {
      return json(response, 200, { messages: getMessages(url.searchParams.get('limit')) });
    }

    if (request.method === 'GET' && url.pathname === '/api/whatsapp/events') {
      response.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      });
      response.write(`event: status\ndata: ${JSON.stringify({ type: 'connection', status: getStatus() })}\n\n`);
      const unsubscribe = subscribe(event => writeSse(response, event));
      request.on('close', unsubscribe);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/whatsapp/connect') {
      try {
        await connect();
        return json(response, 202, getStatus());
      } catch (error) {
        return json(response, 500, {
          error: error instanceof Error ? error.message : String(error),
          status: getStatus(),
        });
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/whatsapp/logout') {
      try {
        await logout();
        return json(response, 200, getStatus());
      } catch (error) {
        return json(response, 500, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/whatsapp/reset-session') {
      try {
        await resetSession();
        return json(response, 200, getStatus());
      } catch (error) {
        return json(response, 500, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/whatsapp/messages') {
      try {
        const body = await parseBody(request);
        const message = await sendText(body.to, body.text);
        return json(response, 202, { message });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const status = message.includes('not connected') ? 409 : 400;
        return json(response, status, { error: message });
      }
    }

    return json(response, 404, { error: 'not_found' });
  });
}

export { connect };
