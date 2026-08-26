import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { createReadinessChecker } from './readiness.mjs';
import { connect, getMessages, getStatus, logout, resetSession, sendText, subscribe } from './whatsapp.mjs';
import { createBatchDispatchRuntime, isDispatchPreview } from './batch-dispatch.mjs';
import { clearConversationPolicy, getAutoReplyStatus, getConversationPolicyStatus, listConversationPolicies, setConversationPolicy } from './auto-reply.mjs';
import { getAiConfig, updateAiConfig } from './ai-config.mjs';
import { getLlmProviderStatus, getLocalModelInventory, updateAllLocalModels, updateLocalModel } from './llm.mjs';
import { getLlmSettings, updateLlmSettings } from './llm-settings.mjs';
import { deleteCredential, listCredentialStatus, setCredential } from './credentials.mjs';
import { getCredentialValidationStatuses, invalidateCredentialStatus, validateCredential } from './credential-validation.mjs';

/** @typedef {import('node:http').IncomingMessage} IncomingMessage */
/** @typedef {import('node:http').ServerResponse<IncomingMessage>} ServerResponse */
/** @typedef {Record<string, unknown>} RequestBody */
/** @typedef {Record<string, unknown>} SseEvent */
/** @typedef {{ ok: boolean }} ReadinessResult */
/** @typedef {() => boolean | ReadinessResult | Promise<boolean | ReadinessResult>} ReadinessCheck */
/** @typedef {{fingerprint:unknown,recipientCount:unknown,correlationId?:string,confirmedAt?:string}} ConfirmActionInput */

/** @param {ServerResponse} response @param {number} statusCode @param {unknown} payload */
function json(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  response.end(body);
}

/** @param {IncomingMessage} request @returns {string} */
function correlationId(request) {
  const supplied = request.headers['x-correlation-id'];
  return typeof supplied === 'string' && supplied.length > 0 ? supplied : randomUUID();
}

/** @param {IncomingMessage} request @returns {Promise<RequestBody>} */
function parseBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.setEncoding('utf8');
    request.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Request body too large'));
        request.destroy();
      }
    });
    request.on('end', () => {
      if (!raw) return resolve({});
      try {
        const parsed = JSON.parse(raw);
        return resolve(parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    request.on('error', reject);
  });
}

/** @param {ServerResponse} response @param {SseEvent} event */
function writeSse(response, event) {
  response.write(`event: ${String(event.type)}\ndata: ${JSON.stringify(event)}\n\n`);
}

/** @param {unknown} error @returns {string} */
function sanitizedError(error) {
  return error instanceof Error ? error.message : String(error);
}

/** @param {RequestBody} body @param {string} correlation @returns {ConfirmActionInput} */
function buildConfirmInput(body, correlation) {
  /** @type {ConfirmActionInput} */
  const input = {
    fingerprint: body.fingerprint,
    recipientCount: body.recipient_count,
    correlationId: correlation,
  };
  if (typeof body.confirmed_at === 'string') input.confirmedAt = body.confirmed_at;
  return input;
}

/** @param {{ readinessChecks?: Record<string, ReadinessCheck>, dispatchRuntime?: ReturnType<typeof createBatchDispatchRuntime> }} [options] */
export function createHttpServer({ readinessChecks = {}, dispatchRuntime = createBatchDispatchRuntime() } = {}) {
  const checkReadiness = createReadinessChecker(readinessChecks);

  return createServer(async (request, response) => {
    const id = correlationId(request);
    response.setHeader('x-correlation-id', id);

    try {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1');

      if (request.method === 'GET' && url.pathname === '/health') return json(response, 200, { status: 'ok', correlation_id: id });
      if (request.method === 'GET' && url.pathname === '/ready') {
        const result = await checkReadiness();
        return result.ready
          ? json(response, 200, { status: 'ready', checks: result.checks, correlation_id: id })
          : json(response, 503, { error: { code: 'not_ready', message: 'Gateway dependencies are not ready.', retryable: true, correlation_id: id }, checks: result.checks });
      }

      if (request.method === 'GET' && url.pathname === '/api/whatsapp/status') return json(response, 200, getStatus());
      if (request.method === 'GET' && url.pathname === '/api/whatsapp/ai/status') return json(response, 200, getAutoReplyStatus());
      if (request.method === 'GET' && url.pathname === '/api/whatsapp/ai/provider') return json(response, 200, await getLlmProviderStatus());

      if (request.method === 'GET' && url.pathname === '/api/whatsapp/ai/config') {
        const config = getAiConfig();
        return json(response, 200, { ...config, configuredConversations: listConversationPolicies().length });
      }
      if (request.method === 'PUT' && url.pathname === '/api/whatsapp/ai/config') {
        try {
          const body = await parseBody(request);
          const allowed = ['enabled', 'baseUrl', 'model', 'timeoutMs', 'contextMessages', 'cooldownMs', 'systemPrompt'];
          const patch = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
          return json(response, 200, updateAiConfig(patch));
        } catch (error) {
          return json(response, 400, { error: sanitizedError(error) });
        }
      }

      if (request.method === 'GET' && url.pathname === '/api/llm/settings') return json(response, 200, getLlmSettings());
      if (request.method === 'PUT' && url.pathname === '/api/llm/settings') {
        try {
          const body = await parseBody(request);
          return json(response, 200, updateLlmSettings(body));
        } catch (error) {
          return json(response, 400, { error: sanitizedError(error) });
        }
      }
      if (request.method === 'GET' && url.pathname === '/api/llm/models') return json(response, 200, { ...await getLlmProviderStatus(), inventory: await getLocalModelInventory() });
      if (request.method === 'POST' && url.pathname === '/api/llm/models/update') {
        try {
          const body = await parseBody(request);
          const model = typeof body.model === 'string' ? body.model.trim() : '';
          if (model) return json(response, 200, await updateLocalModel(model));
          return json(response, 200, await updateAllLocalModels());
        } catch (error) {
          return json(response, 503, { error: sanitizedError(error) });
        }
      }

      if (request.method === 'GET' && url.pathname === '/api/credentials') {
        return json(response, 200, { credentials: listCredentialStatus(getCredentialValidationStatuses()) });
      }
      if (request.method === 'PUT' && url.pathname === '/api/credentials') {
        try {
          const body = await parseBody(request);
          const key = String(body.key ?? '');
          const result = setCredential(key, String(body.value ?? ''));
          invalidateCredentialStatus(key);
          return json(response, 200, result);
        } catch (error) {
          return json(response, 400, { error: sanitizedError(error) });
        }
      }
      if (request.method === 'DELETE' && url.pathname === '/api/credentials') {
        try {
          const key = url.searchParams.get('key') ?? '';
          const result = deleteCredential(key);
          invalidateCredentialStatus(key);
          return json(response, 200, result);
        } catch (error) {
          return json(response, 400, { error: sanitizedError(error) });
        }
      }
      if (request.method === 'POST' && url.pathname === '/api/credentials/validate') {
        try {
          const body = await parseBody(request);
          const result = await validateCredential(String(body.key ?? ''));
          return json(response, 200, result);
        } catch (error) {
          return json(response, 400, { error: sanitizedError(error) });
        }
      }

      if (request.method === 'GET' && url.pathname === '/api/whatsapp/ai/conversations') {
        const jid = url.searchParams.get('jid');
        return jid ? json(response, 200, getConversationPolicyStatus(jid)) : json(response, 200, { policies: listConversationPolicies() });
      }
      if (request.method === 'PUT' && url.pathname === '/api/whatsapp/ai/conversations') {
        try {
          const body = await parseBody(request);
          return json(response, 200, setConversationPolicy(String(body.jid ?? ''), body));
        } catch (error) {
          return json(response, 400, { error: sanitizedError(error) });
        }
      }
      if (request.method === 'DELETE' && url.pathname === '/api/whatsapp/ai/conversations') {
        try {
          return json(response, 200, clearConversationPolicy(url.searchParams.get('jid') ?? ''));
        } catch (error) {
          return json(response, 400, { error: sanitizedError(error) });
        }
      }

      if (request.method === 'GET' && url.pathname === '/api/whatsapp/dispatch/batches') return json(response, 200, { batches: await dispatchRuntime.listBatches() });
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/dispatch/batches') {
        try {
          const body = await parseBody(request);
          if (!isDispatchPreview(body.preview)) throw new Error('A valid PREVIEW is required');
          const batch = await dispatchRuntime.createDraft(body.preview, { correlationId: id, ...(typeof body.batch_id === 'string' ? { batchId: body.batch_id } : {}) });
          return json(response, 201, { batch });
        } catch (error) {
          return json(response, 400, { error: sanitizedError(error), correlation_id: id });
        }
      }
      const batchMatch = url.pathname.match(/^\/api\/whatsapp\/dispatch\/batches\/([^/]+)$/);
      if (batchMatch) {
        const batchId = batchMatch[1];
        if (request.method === 'GET') {
          try { return json(response, 200, { batch: await dispatchRuntime.getBatch(batchId) }); }
          catch (error) { return json(response, 404, { error: sanitizedError(error), correlation_id: id }); }
        }
        if (request.method === 'POST') {
          try {
            const actionBody = await parseBody(request);
            const action = String(actionBody.action ?? '');
            if (action === 'confirm') {
              return json(response, 200, { batch: await dispatchRuntime.confirmBatch(batchId, buildConfirmInput(actionBody, id)) });
            }
            if (action === 'queue') return json(response, 202, { batch: await dispatchRuntime.queueBatch(batchId, { causationId: id }) });
            if (action === 'cancel') return json(response, 200, { batch: await dispatchRuntime.cancelBatch(batchId) });
            return json(response, 400, { error: 'Unsupported dispatch action', correlation_id: id });
          } catch (error) {
            return json(response, 409, { error: sanitizedError(error), correlation_id: id });
          }
        }
      }

      if (request.method === 'GET' && url.pathname === '/api/whatsapp/messages') return json(response, 200, { messages: getMessages(url.searchParams.get('limit')) });
      if (request.method === 'GET' && url.pathname === '/api/whatsapp/events') {
        response.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache', connection: 'keep-alive' });
        response.write(`event: status\ndata: ${JSON.stringify({ type: 'connection', status: getStatus() })}\n\n`);
        const unsubscribe = subscribe(event => writeSse(response, event));
        request.on('close', unsubscribe);
        return;
      }
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/connect') {
        try { await connect(); return json(response, 202, getStatus()); }
        catch (error) { return json(response, 500, { error: sanitizedError(error), status: getStatus() }); }
      }
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/logout') {
        try { await logout(); return json(response, 200, getStatus()); }
        catch (error) { return json(response, 500, { error: sanitizedError(error) }); }
      }
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/reset-session') {
        try { await resetSession(); return json(response, 200, getStatus()); }
        catch (error) { return json(response, 500, { error: sanitizedError(error) }); }
      }
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/messages') {
        try {
          const body = await parseBody(request);
          const message = await sendText(String(body.to ?? ''), String(body.text ?? ''));
          return json(response, 202, { message });
        } catch (error) {
          const message = sanitizedError(error);
          return json(response, message.includes('not connected') ? 409 : 400, { error: message });
        }
      }

      return json(response, 404, { error: { code: 'not_found', message: 'Route not found.', retryable: false, correlation_id: id } });
    } catch {
      return json(response, 500, { error: { code: 'internal_error', message: 'Internal server error.', retryable: true, correlation_id: id } });
    }
  });
}

export { connect };
