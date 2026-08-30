import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { createReadinessChecker } from './readiness.mjs';
import { connect, getMessages, getStatus, logout, resetSession, sendText, subscribe } from './whatsapp.mjs';
import { createBatchDispatchRuntime, isDispatchPreview } from './batch-dispatch.mjs';
import { createCampaignDispatchRuntime } from './campaign-dispatch.mjs';
import { clearConversationPolicy, getAutoReplyStatus, getConversationPolicyStatus, listConversationPolicies, setConversationPolicy } from './auto-reply.mjs';
import { getAiConfig, updateAiConfig } from './ai-config.mjs';
import { getAssistantConfig, getAssistantPromptResolution, updateAssistantConfig } from './assistant-config.mjs';
import { analyzeConversation } from './conversation-analysis.mjs';
import { parseCsv, createManualPreview } from './dispatch-input.mjs';
import { getLlmProviderStatus, getLocalModelInventory, updateAllLocalModels, updateLocalModel } from './llm.mjs';
import { getLlmSettings, updateLlmSettings } from './llm-settings.mjs';
import { deleteCredential, listCredentialStatus, setCredential } from './credentials.mjs';
import { getCredentialValidationStatuses, invalidateCredentialStatus, validateCredential } from './credential-validation.mjs';
import { createProduct, deleteProduct, getConversationContext, getProduct, getDashboardSummary, getPersistenceHealth, listPersistedConversations, listProducts, updateProduct } from './persistence-client.mjs';

function json(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(body), 'cache-control': 'no-store' });
  response.end(body);
}

function correlationId(request) {
  const supplied = request.headers['x-correlation-id'];
  return typeof supplied === 'string' && supplied.length > 0 ? supplied : randomUUID();
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.setEncoding('utf8');
    request.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) { reject(new Error('Request body too large')); request.destroy(); }
    });
    request.on('end', () => {
      if (!raw) return resolve({});
      try {
        const parsed = JSON.parse(raw);
        resolve(parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {});
      } catch { reject(new Error('Invalid JSON body')); }
    });
    request.on('error', reject);
  });
}

function writeSse(response, event) { response.write(`event: ${String(event.type)}\ndata: ${JSON.stringify(event)}\n\n`); }
function sanitizedError(error) { return error instanceof Error ? error.message : String(error); }
function buildConfirmInput(body, correlation) {
  const input = { fingerprint: body.fingerprint, recipientCount: body.recipient_count, correlationId: correlation };
  if (typeof body.confirmed_at === 'string') input.confirmedAt = body.confirmed_at;
  return input;
}

export function createHttpServer({ readinessChecks = {}, dispatchRuntime, campaignRuntime } = {}) {
  const getDispatchRuntime = () => {
    dispatchRuntime ??= createBatchDispatchRuntime();
    return dispatchRuntime;
  };

  const getCampaignRuntime = () => {
    campaignRuntime ??= createCampaignDispatchRuntime();
    return campaignRuntime;
  };
  const checkReadiness = createReadinessChecker(readinessChecks);
  return createServer(async (request, response) => {
    const id = correlationId(request);
    response.setHeader('x-correlation-id', id);
    try {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1');
      if (request.method === 'GET' && url.pathname === '/health') return json(response, 200, { status: 'ok', correlation_id: id });

      if (request.method === 'GET' && url.pathname === '/api/dashboard/summary') {
        try {
          const [summary, persistenceHealth, llm] = await Promise.all([getDashboardSummary(), getPersistenceHealth(), getLlmProviderStatus()]);
          const whatsapp = getStatus();
          const integrations = { gateway: 'READY', persistence: persistenceHealth.status === 'ok' ? 'READY' : 'UNAVAILABLE', llm: llm.reachable ? (llm.selectedModelAvailable ? 'READY' : 'DEGRADED') : 'UNAVAILABLE', whatsapp: whatsapp.connection };
          const alerts = [];
          if (whatsapp.connection === 'ERROR') alerts.push({ severity: 'P1', source: 'WhatsApp', message: whatsapp.lastError || 'WhatsApp reported a connection error.' });
          else if (whatsapp.connection === 'DISCONNECTED') alerts.push({ severity: 'P2', source: 'WhatsApp', message: 'WhatsApp is disconnected.' });
          if (integrations.llm === 'UNAVAILABLE') alerts.push({ severity: 'P1', source: 'LLM/Ollama', message: llm.error || 'LLM runtime is unavailable.' });
          else if (integrations.llm === 'DEGRADED') alerts.push({ severity: 'P2', source: 'LLM/Ollama', message: 'Ollama is reachable but the selected model is unavailable.' });
          return json(response, 200, { summary, integrations, alerts, correlation_id: id });
        } catch (error) {
          console.error('[KassisT Dashboard] failed to load dashboard data:', error);
          return json(response, 503, { error: { code: 'dashboard_unavailable', message: sanitizedError(error), retryable: true, correlation_id: id }, integrations: { gateway: 'READY', persistence: 'UNAVAILABLE', llm: 'UNKNOWN', whatsapp: getStatus().connection } });
        }
      }
      if (request.method === 'GET' && url.pathname === '/ready') {
        const result = await checkReadiness();
        return result.ready ? json(response, 200, { status: 'ready', checks: result.checks, correlation_id: id }) : json(response, 503, { error: { code: 'not_ready', message: 'Gateway dependencies are not ready.', retryable: true, correlation_id: id }, checks: result.checks });
      }

      if (request.method === 'GET' && url.pathname === '/api/whatsapp/status') return json(response, 200, getStatus());
      if (request.method === 'GET' && url.pathname === '/api/whatsapp/ai/status') return json(response, 200, getAutoReplyStatus());
      if (request.method === 'GET' && url.pathname === '/api/whatsapp/ai/provider') return json(response, 200, await getLlmProviderStatus());

      if (request.method === 'GET' && url.pathname === '/api/assistant/config') return json(response, 200, getAssistantConfig());
      if (request.method === 'GET' && url.pathname === '/api/assistant/prompt') return json(response, 200, getAssistantPromptResolution());
      if (request.method === 'PUT' && url.pathname === '/api/assistant/config') {
        try {
          const body = await parseBody(request);
          const allowed = ['assistantName','businessName','role','personality','toneOfVoice','language','responseFormat','commercialRules','deliveryFeePolicy','deliveryInstructions','businessHours','behaviorInstructions','limitations','llm','autoReplyEnabled'];
          const patch = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
          const config = updateAssistantConfig(patch);
          updateAiConfig({ enabled: config.autoReplyEnabled, model: config.llm.model, baseUrl: config.llm.baseUrl });
          return json(response, 200, config);
        } catch (error) { return json(response, 400, { error: sanitizedError(error) }); }
      }

      if (request.method === 'GET' && url.pathname === '/api/whatsapp/ai/config') return json(response, 200, { ...getAiConfig(), assistant: getAssistantConfig(), configuredConversations: listConversationPolicies().length });
      if (request.method === 'PUT' && url.pathname === '/api/whatsapp/ai/config') {
        try {
          const body = await parseBody(request);
          const allowed = ['enabled', 'baseUrl', 'model', 'timeoutMs', 'contextMessages', 'cooldownMs', 'systemPrompt'];
          return json(response, 200, updateAiConfig(Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)))));
        } catch (error) { return json(response, 400, { error: sanitizedError(error) }); }
      }

      if (request.method === 'GET' && url.pathname === '/api/llm/settings') return json(response, 200, getLlmSettings());
      if (request.method === 'PUT' && url.pathname === '/api/llm/settings') {
        try { return json(response, 200, updateLlmSettings(await parseBody(request))); } catch (error) { return json(response, 400, { error: sanitizedError(error) }); }
      }
      if (request.method === 'GET' && url.pathname === '/api/llm/models') return json(response, 200, { ...await getLlmProviderStatus(), inventory: await getLocalModelInventory() });
      if (request.method === 'POST' && url.pathname === '/api/llm/models/update') {
        try { const body = await parseBody(request); const model = typeof body.model === 'string' ? body.model.trim() : ''; return json(response, 200, model ? await updateLocalModel(model) : await updateAllLocalModels()); }
        catch (error) { return json(response, 503, { error: sanitizedError(error) }); }
      }

      if (request.method === 'GET' && url.pathname === '/api/products') {
        try { return json(response, 200, await listProducts()); } catch (error) { return json(response, 503, { error: sanitizedError(error) }); }
      }
      if (request.method === 'POST' && url.pathname === '/api/products') {
        try { return json(response, 201, await createProduct(await parseBody(request))); } catch (error) { return json(response, 400, { error: sanitizedError(error) }); }
      }
      const productMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
      if (productMatch) {
        const productId = decodeURIComponent(productMatch[1]);
        if (request.method === 'GET') { try { return json(response, 200, await getProduct(productId)); } catch (error) { return json(response, 404, { error: sanitizedError(error) }); } }
        if (request.method === 'PUT') { try { return json(response, 200, await updateProduct(productId, await parseBody(request))); } catch (error) { return json(response, 400, { error: sanitizedError(error) }); } }
        if (request.method === 'DELETE') { try { return json(response, 200, await deleteProduct(productId)); } catch (error) { return json(response, 409, { error: sanitizedError(error) }); } }
      }

      if (request.method === 'GET' && url.pathname === '/api/whatsapp/conversations') {
        try { return json(response, 200, await listPersistedConversations(url.searchParams.get('limit') || 100)); } catch (error) { return json(response, 503, { error: sanitizedError(error) }); }
      }
      if (request.method === 'GET' && url.pathname === '/api/whatsapp/conversation-context') {
        try { return json(response, 200, await getConversationContext(url.searchParams.get('jid') || '', url.searchParams.get('limit') || 50)); } catch (error) { return json(response, 404, { error: sanitizedError(error) }); }
      }
      if (request.method === 'GET' && url.pathname === '/api/whatsapp/conversation-analysis') {
        try { return json(response, 200, await analyzeConversation(url.searchParams.get('jid') || '', url.searchParams.get('limit') || 500)); } catch (error) { return json(response, 404, { error: sanitizedError(error) }); }
      }

      if (request.method === 'POST' && url.pathname === '/api/whatsapp/dispatch/preview/csv') {
        try { const body = await parseBody(request); return json(response, 200, parseCsv(String(body.csv ?? ''))); }
        catch (error) { return json(response, 400, { error: sanitizedError(error), correlation_id: id }); }
      }
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/dispatch/preview/manual') {
        try { const body = await parseBody(request); return json(response, 200, createManualPreview(body.contacts)); }
        catch (error) { return json(response, 400, { error: sanitizedError(error), correlation_id: id }); }
      }

      if (request.method === 'POST' && url.pathname === '/api/whatsapp/dispatch/campaign/preview') {
        try { const body = await parseBody(request); return json(response, 200, await getCampaignRuntime().preview(body)); }
        catch (error) { return json(response, 400, { error: sanitizedError(error), correlation_id: id }); }
      }
      if (request.method === 'GET' && url.pathname === '/api/whatsapp/dispatch/campaigns') {
        try { return json(response, 200, { campaigns: await getCampaignRuntime().listCampaigns() }); }
        catch (error) { return json(response, 503, { error: sanitizedError(error), correlation_id: id }); }
      }
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/dispatch/campaigns') {
        try {
          const body = await parseBody(request);
          const result = await getCampaignRuntime().createDraft(body.preview, { correlationId: id, ...(typeof body.batch_id === 'string' ? { batchId: body.batch_id } : {}) });
          return json(response, 201, result);
        } catch (error) { return json(response, 400, { error: sanitizedError(error), correlation_id: id }); }
      }
      const campaignMatch = url.pathname.match(/^\/api\/whatsapp\/dispatch\/campaigns\/([^/]+)$/);
      if (campaignMatch) {
        const campaignId = decodeURIComponent(campaignMatch[1]);
        if (request.method === 'GET') {
          try { return json(response, 200, await getCampaignRuntime().getCampaign(campaignId)); }
          catch (error) { return json(response, 404, { error: sanitizedError(error), correlation_id: id }); }
        }
        if (request.method === 'POST') {
          try {
            const actionBody = await parseBody(request);
            const action = String(actionBody.action ?? '');
            if (action === 'confirm') return json(response, 200, await getCampaignRuntime().confirmCampaign(campaignId, buildConfirmInput(actionBody, id)));
            if (action === 'queue') return json(response, 202, await getCampaignRuntime().queueCampaign(campaignId, { causationId: id }));
            if (action === 'cancel') return json(response, 200, await getCampaignRuntime().cancelCampaign(campaignId));
            return json(response, 400, { error: 'Unsupported campaign action', correlation_id: id });
          } catch (error) { return json(response, 409, { error: sanitizedError(error), correlation_id: id }); }
        }
      }

      if (request.method === 'GET' && url.pathname === '/api/credentials') return json(response, 200, { credentials: listCredentialStatus(getCredentialValidationStatuses()) });
      if (request.method === 'PUT' && url.pathname === '/api/credentials') {
        try { const body = await parseBody(request); const key = String(body.key ?? ''); const result = setCredential(key, String(body.value ?? '')); invalidateCredentialStatus(key); return json(response, 200, result); }
        catch (error) { return json(response, 400, { error: sanitizedError(error) }); }
      }
      if (request.method === 'DELETE' && url.pathname === '/api/credentials') {
        try { const key = url.searchParams.get('key') ?? ''; const result = deleteCredential(key); invalidateCredentialStatus(key); return json(response, 200, result); }
        catch (error) { return json(response, 400, { error: sanitizedError(error) }); }
      }
      if (request.method === 'POST' && url.pathname === '/api/credentials/validate') {
        try { const body = await parseBody(request); return json(response, 200, await validateCredential(String(body.key ?? ''))); }
        catch (error) { return json(response, 400, { error: sanitizedError(error) }); }
      }

      if (request.method === 'GET' && url.pathname === '/api/whatsapp/ai/conversations') {
        const jid = url.searchParams.get('jid');
        return jid ? json(response, 200, getConversationPolicyStatus(jid)) : json(response, 200, { policies: listConversationPolicies() });
      }
      if (request.method === 'PUT' && url.pathname === '/api/whatsapp/ai/conversations') {
        try { const body = await parseBody(request); return json(response, 200, setConversationPolicy(String(body.jid ?? ''), body)); }
        catch (error) { return json(response, 400, { error: sanitizedError(error) }); }
      }
      if (request.method === 'DELETE' && url.pathname === '/api/whatsapp/ai/conversations') {
        try { return json(response, 200, clearConversationPolicy(url.searchParams.get('jid') ?? '')); }
        catch (error) { return json(response, 400, { error: sanitizedError(error) }); }
      }

      if (request.method === 'GET' && url.pathname === '/api/whatsapp/dispatch/batches') return json(response, 200, { batches: await getDispatchRuntime().listBatches() });
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/dispatch/batches') {
        try {
          const body = await parseBody(request);
          if (!isDispatchPreview(body.preview)) throw new Error('A valid PREVIEW is required');
          const batch = await getDispatchRuntime().createDraft(body.preview, { correlationId: id, ...(typeof body.batch_id === 'string' ? { batchId: body.batch_id } : {}) });
          return json(response, 201, { batch });
        } catch (error) { return json(response, 400, { error: sanitizedError(error), correlation_id: id }); }
      }
      const batchMatch = url.pathname.match(/^\/api\/whatsapp\/dispatch\/batches\/([^/]+)$/);
      if (batchMatch) {
        const batchId = batchMatch[1];
        if (request.method === 'GET') { try { return json(response, 200, { batch: await getDispatchRuntime().getBatch(batchId) }); } catch (error) { return json(response, 404, { error: sanitizedError(error), correlation_id: id }); } }
        if (request.method === 'POST') {
          try {
            const actionBody = await parseBody(request); const action = String(actionBody.action ?? '');
            if (action === 'confirm') return json(response, 200, { batch: await getDispatchRuntime().confirmBatch(batchId, buildConfirmInput(actionBody, id)) });
            if (action === 'queue') return json(response, 202, { batch: await getDispatchRuntime().queueBatch(batchId, { causationId: id }) });
            if (action === 'cancel') return json(response, 200, { batch: await getDispatchRuntime().cancelBatch(batchId) });
            return json(response, 400, { error: 'Unsupported dispatch action', correlation_id: id });
          } catch (error) { return json(response, 409, { error: sanitizedError(error), correlation_id: id }); }
        }
      }

      if (request.method === 'GET' && url.pathname === '/api/whatsapp/messages') return json(response, 200, { messages: getMessages(url.searchParams.get('limit')) });
      if (request.method === 'GET' && url.pathname === '/api/whatsapp/events') {
        response.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache', connection: 'keep-alive' });
        response.write(`event: status\ndata: ${JSON.stringify({ type: 'connection', status: getStatus() })}\n\n`);
        const unsubscribe = subscribe(event => writeSse(response, event)); request.on('close', unsubscribe); return;
      }
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/connect') {
        try { await connect(); return json(response, 202, getStatus()); } catch (error) { return json(response, 500, { error: sanitizedError(error), status: getStatus() }); }
      }
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/logout') {
        try { await logout(); return json(response, 200, getStatus()); } catch (error) { return json(response, 500, { error: sanitizedError(error) }); }
      }
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/reset-session') {
        try { await resetSession(); return json(response, 200, getStatus()); } catch (error) { return json(response, 500, { error: sanitizedError(error) }); }
      }
      if (request.method === 'POST' && url.pathname === '/api/whatsapp/messages') {
        try { const body = await parseBody(request); const message = await sendText(String(body.to ?? ''), String(body.text ?? '')); return json(response, 202, { message }); }
        catch (error) { const message = sanitizedError(error); return json(response, message.includes('not connected') ? 409 : 400, { error: message }); }
      }

      return json(response, 404, { error: { code: 'not_found', message: 'Route not found.', retryable: false, correlation_id: id } });
    } catch {
      return json(response, 500, { error: { code: 'internal_error', message: 'Internal server error.', retryable: true, correlation_id: id } });
    }
  });
}

export { connect };
