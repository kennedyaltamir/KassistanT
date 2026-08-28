(() => {
  const GATEWAY = 'http://127.0.0.1:3210';
  const state = { page: null, assistant: null, products: [], conversations: [], selectedJid: null, context: null, analysis: null, dispatchPreview: null, dispatchBatch: null, dispatchMode: 'csv', error: null };

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>\"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[char]));
  const main = () => $('#main');
  const toast = text => { const root = $('#toast-root'); if (!root) return; root.innerHTML = `<div class="toast" role="status">${esc(text)}</div>`; setTimeout(() => { root.innerHTML = ''; }, 3000); };

  async function api(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${GATEWAY}${path}`, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) }, signal: controller.signal });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : `Falha HTTP ${response.status}`);
      return body;
    } finally { clearTimeout(timer); }
  }

  function field(label, id, value = '', type = 'text', extra = '') {
    return `<div class="field"><label for="${id}">${esc(label)}</label><input id="${id}" type="${type}" value="${esc(value)}" ${extra}></div>`;
  }
  function area(label, id, value = '', extra = '') {
    return `<div class="field"><label for="${id}">${esc(label)}</label><textarea id="${id}" ${extra}>${esc(value)}</textarea></div>`;
  }
  function selectField(label, id, value, options) {
    return `<div class="field"><label for="${id}">${esc(label)}</label><select id="${id}">${options.map(([v,l]) => `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
  }
  function formatHours(hours) { return Array.isArray(hours) && hours.length ? hours.map(item => `${item.day}: ${item.closed ? 'CLOSED' : `${item.open}-${item.close}`}`).join('\n') : ''; }
  function parseHours(text) {
    const raw = String(text ?? '').trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
      const match = line.match(/^([A-Za-z_-]+)\s*:\s*(CLOSED|([01]\d|2[0-3]):[0-5]\d\s*-\s*([01]\d|2[0-3]):[0-5]\d)$/i);
      if (!match) throw new Error(`Horário inválido: ${line}`);
      const day = match[1].toUpperCase();
      if (match[2].toUpperCase() === 'CLOSED') return { day, closed: true, open: '', close: '' };
      const [open, close] = match[2].split('-').map(value => value.trim());
      return { day, open, close, closed: false };
    });
  }
  function deliveryPolicy(config) {
    const policy = config?.deliveryFeePolicy && typeof config.deliveryFeePolicy === 'object' ? config.deliveryFeePolicy : {};
    let mode = 'UNKNOWN';
    if (policy.enabled && Number(policy.amountCents) === 0) mode = 'FREE';
    else if (policy.enabled && Number.isInteger(policy.amountCents)) mode = 'FIXED';
    else if (policy.enabled) mode = 'CALCULATED';
    return { mode, amountCents: policy.amountCents ?? '', rule: policy.rule ?? '' };
  }

  function interceptNavigation() {
    if (document.__kassistFeatureUiBound) return;
    document.__kassistFeatureUiBound = true;
    document.addEventListener('click', event => {
      const button = event.target.closest?.('[data-page]');
      if (!button) return;
      const page = button.dataset.page;
      if (!['assistant','products','conversations','broadcasts','settings'].includes(page) || page === 'settings') return;
      event.preventDefault(); event.stopImmediatePropagation(); state.page = page; renderFeaturePage();
    }, true);
  }

  async function renderFeaturePage() {
    const target = main(); if (!target || !state.page) return;
    state.error = null;
    if (state.page === 'assistant') { target.innerHTML = assistantView(); bindAssistant(); await loadAssistant(); return; }
    if (state.page === 'products') { target.innerHTML = productsView(); bindProducts(); await loadProducts(); return; }
    if (state.page === 'conversations') { target.innerHTML = conversationsView(); bindConversations(); await loadConversations(); return; }
    if (state.page === 'broadcasts') { target.innerHTML = broadcastsView(); bindBroadcasts(); }
  }

  function renderFeaturePageSync() {
    const target = main(); if (!target || !state.page) return;
    if (state.page === 'assistant') { target.innerHTML = assistantView(); bindAssistant(); }
    if (state.page === 'products') { target.innerHTML = productsView(); bindProducts(); }
    if (state.page === 'conversations') { target.innerHTML = conversationsView(); bindConversations(); }
    if (state.page === 'broadcasts') { target.innerHTML = broadcastsView(); bindBroadcasts(); }
  }

  function assistantView() {
    const c = state.assistant || {}; const llm = c.llm || {}; const fee = deliveryPolicy(c);
    return `<div class="toolbar"><div><h2>Assistente / IA</h2><p class="muted">Configuração estruturada persistida e compilada pelo runtime.</p></div><span class="badge ${c.autoReplyEnabled ? 'ok' : 'neutral'}">${c.autoReplyEnabled ? 'AUTO-REPLY ATIVO' : 'AUTO-REPLY DESATIVADO'}</span></div>
      ${state.error ? `<div class="notice error"><div class="notice-icon">!</div><div>${esc(state.error)}</div></div>` : ''}
      <section class="card"><div class="card-body"><div class="grid grid-2">
        ${field('Nome do assistente','assistantName',c.assistantName)}
        ${field('Empresa / negócio','businessName',c.businessName)}
        ${field('Função','role',c.role)}
        ${selectField('Idioma','language',c.language,[['pt-BR','Português (Brasil)'],['pt-PT','Português (Portugal)'],['en-US','English (US)'],['es-ES','Español']])}
        ${field('Personalidade','personality',c.personality)}
        ${field('Tom de voz','toneOfVoice',c.toneOfVoice)}
        ${selectField('Formato da resposta','responseFormat',c.responseFormat,[['natural_text','Natural / conversacional'],['concise_text','Objetivo / curto'],['bullet_points','Estruturado'],['markdown','Markdown']])}
        ${selectField('Política de entrega','deliveryPolicyMode',fee.mode,[['UNKNOWN','Não definido'],['FREE','Frete grátis'],['FIXED','Taxa fixa'],['CALCULATED','Calculada conforme regra']])}
        ${field('Taxa de entrega (R$)','deliveryFeeAmount',fee.amountCents === '' ? '' : (Number(fee.amountCents)/100).toFixed(2),'number','step="0.01" min="0"')}
        ${field('Modelo Ollama','llmModel',llm.model)}
        ${field('Endpoint local','llmBaseUrl',llm.baseUrl,'text','readonly')}
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        ${area('Regra de cobrança / entrega','deliveryFeeRule',fee.rule)}
        ${area('Regras comerciais','commercialRules',c.commercialRules)}
        ${area('Orientações de entrega','deliveryInstructions',c.deliveryInstructions)}
        ${area('Horário de atendimento','businessHours',formatHours(c.businessHours),'placeholder="MONDAY: 09:00-18:00&#10;TUESDAY: CLOSED"')}
        ${area('Instruções de comportamento','behaviorInstructions',c.behaviorInstructions)}
        ${area('Limitações do assistente','limitations',c.limitations)}
      </div>
      <div class="setting-row" style="margin-top:16px"><div><strong>Atendimento automático</strong><div class="muted">Novas mensagens podem acionar o pipeline LLM → outbound.</div></div>${selectField('','autoReplyEnabled',c.autoReplyEnabled ? 'true' : 'false',[['false','Desativado'],['true','Ativado']])}</div>
      <div class="actions" style="margin-top:18px"><button class="btn" id="assistant-prompt">Visualizar prompt compilado</button><button class="btn primary" id="assistant-save">Salvar configuração</button></div><div id="assistant-prompt-output" style="margin-top:16px"></div></div></section>`;
  }

  async function loadAssistant() { try { state.assistant = await api('/api/assistant/config'); renderFeaturePageSync(); } catch (error) { state.error = error instanceof Error ? error.message : String(error); renderFeaturePageSync(); } }
  function bindAssistant() {
    $('#assistant-save')?.addEventListener('click', async () => {
      try {
        const mode = $('#deliveryPolicyMode')?.value || 'UNKNOWN'; const amountText = $('#deliveryFeeAmount')?.value?.trim() || '';
        const feeRule = $('#deliveryFeeRule')?.value?.trim() || '';
        const amountNumber = amountText === '' ? null : Number(amountText);
        if (amountNumber !== null && (!Number.isFinite(amountNumber) || amountNumber < 0)) throw new Error('Taxa de entrega inválida.');
        const deliveryFeePolicy = mode === 'UNKNOWN' ? { enabled: false, amountCents: null, currency: 'BRL', rule: '' } : {
          enabled: true,
          amountCents: mode === 'FREE' ? 0 : (amountNumber === null ? null : Math.round(amountNumber * 100)),
          currency: 'BRL',
          rule: feeRule
        };
        const body = {
          assistantName: $('#assistantName')?.value,
          businessName: $('#businessName')?.value,
          role: $('#role')?.value,
          personality: $('#personality')?.value,
          toneOfVoice: $('#toneOfVoice')?.value,
          language: $('#language')?.value,
          responseFormat: $('#responseFormat')?.value,
          commercialRules: $('#commercialRules')?.value,
          deliveryFeePolicy,
          deliveryInstructions: $('#deliveryInstructions')?.value,
          businessHours: parseHours($('#businessHours')?.value),
          behaviorInstructions: $('#behaviorInstructions')?.value,
          limitations: $('#limitations')?.value,
          llm: { model: $('#llmModel')?.value?.trim(), baseUrl: $('#llmBaseUrl')?.value },
          autoReplyEnabled: $('#autoReplyEnabled')?.value === 'true'
        };
        state.assistant = await api('/api/assistant/config', { method:'PUT', body: JSON.stringify(body) });
        toast('Configuração do assistente salva.'); renderFeaturePageSync();
      } catch (error) { state.error = error instanceof Error ? error.message : String(error); renderFeaturePageSync(); }
    });
    $('#assistant-prompt')?.addEventListener('click', async () => { try { const result = await api('/api/assistant/prompt'); $('#assistant-prompt-output').innerHTML = `<div class="notice"><div class="notice-icon">✓</div><div><strong>Prompt v${esc(result.promptVersion || 'UNKNOWN')}</strong><pre class="mono" style="white-space:pre-wrap;margin:10px 0 0">${esc(result.systemPrompt || '')}</pre></div></div>`; } catch (error) { toast(error instanceof Error ? error.message : String(error)); } });
  }

  function productsView() { return `<div class="toolbar"><div><h2>Produtos</h2><p class="muted">Catálogo persistido no SQLite. Preços em centavos e estoque com estado explícito.</p></div><div class="actions"><button class="btn primary" id="product-new">Adicionar produto</button><button class="btn" id="product-refresh">Atualizar</button></div></div>${state.error ? `<div class="notice error"><div class="notice-icon">!</div><div>${esc(state.error)}</div></div>`:''}<section class="card"><div class="card-body"><div class="table-wrap"><table class="table"><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Disponibilidade</th><th></th></tr></thead><tbody>${state.products.length ? state.products.map(productRow).join('') : '<tr><td colspan="6"><div class="empty-state"><h3>Nenhum produto</h3><p>Crie o primeiro produto do catálogo.</p></div></td></tr>'}</tbody></table></div></div></section>`; }
  function productRow(p) { return `<tr class="row-hover"><td><strong>${esc(p.name)}</strong><div class="muted">${esc(p.description || '')}</div></td><td>${esc(p.category || 'Sem categoria')}</td><td>R$ ${(Number(p.priceCents || 0)/100).toFixed(2).replace('.',',')}</td><td>${esc(p.stockQuantity)}</td><td>${p.available ? '<span class="badge ok">DISPONÍVEL</span>' : '<span class="badge neutral">INDISPONÍVEL</span>'}</td><td><div class="actions"><button class="btn" data-product-edit="${esc(p.id)}">Editar</button><button class="btn danger" data-product-delete="${esc(p.id)}">Remover</button></div></td></tr>`; }
  async function loadProducts() { try { const result = await api('/api/products'); state.products = Array.isArray(result) ? result : result.products || []; renderFeaturePageSync(); } catch(error) { state.error = error instanceof Error ? error.message : String(error); renderFeaturePageSync(); } }
  function bindProducts() {
    $('#product-refresh')?.addEventListener('click', loadProducts); $('#product-new')?.addEventListener('click', () => productDialog());
    document.querySelectorAll('[data-product-edit]').forEach(button => button.addEventListener('click', () => productDialog(state.products.find(p => p.id === button.dataset.productEdit))));
    document.querySelectorAll('[data-product-delete]').forEach(button => button.addEventListener('click', async () => { const product = state.products.find(p => p.id === button.dataset.productDelete); if (!product || !window.confirm(`Remover o produto "${product.name}"?`)) return; try { await api(`/api/products/${encodeURIComponent(product.id)}`, { method:'DELETE' }); toast('Produto removido.'); await loadProducts(); } catch(error) { toast(error instanceof Error ? error.message : String(error)); } }));
  }
  function productDialog(product = null) {
    const p = product || {}; const root = $('#dialog-root'); root.innerHTML = `<div class="dialog-backdrop"><section class="dialog" role="dialog" aria-modal="true"><div class="section-title"><h3>${product ? 'Editar produto' : 'Novo produto'}</h3><button class="btn" id="product-dialog-close">Fechar</button></div><div class="grid grid-2">${field('Nome','p-name',p.name)}${field('Preço (R$)','p-price',p.priceCents != null ? (Number(p.priceCents)/100).toFixed(2) : '','number','step="0.01" min="0" required')}${field('Categoria','p-category',p.category)}${field('Estoque','p-stock',p.stockQuantity ?? 0,'number','step="1" min="0" required')}${selectField('Disponibilidade','p-available',p.available === false ? 'false' : 'true',[['true','Disponível'],['false','Indisponível']])}</div><div style="margin-top:12px">${area('Descrição','p-description',p.description || '')}${field('Referência da foto','p-image',p.imageReference || '','text','placeholder="referência local existente"')}</div><div class="actions" style="margin-top:16px"><button class="btn primary" id="product-dialog-save">Salvar</button></div></section></div>`;
    $('#product-dialog-close').onclick = () => { root.innerHTML = ''; };
    $('#product-dialog-save').onclick = async () => { try { const amount = Number($('#p-price').value); const stock = Number($('#p-stock').value); if (!$('#p-name').value.trim() || !Number.isFinite(amount) || amount < 0 || !Number.isInteger(stock) || stock < 0) throw new Error('Verifique nome, preço e estoque.'); const body = { name: $('#p-name').value, priceCents: Math.round(amount * 100), category: $('#p-category').value, stockQuantity: stock, available: $('#p-available').value === 'true', description: $('#p-description').value, imageReference: $('#p-image').value || null }; if (product) await api(`/api/products/${encodeURIComponent(product.id)}`, { method:'PUT', body:JSON.stringify(body) }); else await api('/api/products',{method:'POST',body:JSON.stringify(body)}); root.innerHTML=''; toast('Produto salvo.'); await loadProducts(); } catch(error) { toast(error instanceof Error ? error.message : String(error)); } };
  }

  function conversationsView() { return `<div class="toolbar"><div><h2>Conversas</h2><p class="muted">Contexto persistido por conversa, análise auditável e histórico real.</p></div><button class="btn" id="conversation-refresh">Atualizar</button></div><section class="card"><div class="card-body"><div class="grid grid-2"><div><h3 style="margin-top:0">Conversas persistidas</h3><div id="conversation-list">${state.conversations.length ? state.conversations.map(c => { const jid = c.externalThreadId || c.jid || ''; const label = c.customer?.name || jid || 'UNKNOWN'; const last = c.lastMessage?.text || '[sem texto]'; return `<button class="conversation-row ${jid === state.selectedJid ? 'active' : ''}" data-conversation-jid="${esc(jid)}"><div class="row-top"><span class="row-name">${esc(label)}</span><span class="row-time">${esc(c.updatedAt || '')}</span></div><div class="row-preview">${esc(last)}</div></button>`; }).join('') : '<div class="empty-state"><h3>Nenhuma conversa persistida</h3><p>O banco ainda não possui conversas disponíveis.</p></div>'}</div></div><div>${state.selectedJid ? conversationDetail() : '<div class="empty-state"><h3>Selecione uma conversa</h3><p>O contexto e a análise aparecerão aqui.</p></div>'}</div></div></div></section>`; }
  function conversationDetail() { const ctx = state.context || {}; const a = state.analysis; const phone = ctx.customer?.phoneNormalized || ctx.customer?.phone || 'UNKNOWN'; return `<div class="section-title"><div><h3>${esc(ctx.customer?.name || state.selectedJid || 'UNKNOWN')}</h3><div class="mono muted">${esc(state.selectedJid)}</div></div><div class="actions"><button class="btn" id="conversation-context-refresh">Recarregar contexto</button><button class="btn primary" id="conversation-analyze">Analisar conversa</button></div></div><div class="grid grid-2"><section class="notice"><div><strong>Customer</strong><div>${esc(ctx.customer?.name || 'UNKNOWN')}</div><div class="mono">${esc(phone)}</div></div></section><section class="notice"><div><strong>Estado</strong><div>${esc(JSON.stringify(ctx.currentState || 'UNKNOWN'))}</div></div></section></div><div class="setting-block"><h4>Histórico</h4>${(ctx.messages || []).map(m => `<div style="padding:9px 0;border-bottom:1px solid var(--line)"><span class="badge ${m.direction === 'OUTBOUND' ? 'info' : 'neutral'}">${esc(m.direction)}</span> ${esc(m.text || '[sem texto]')}<div class="muted" style="font-size:10px">${esc(m.id || '')} · ${esc(m.message_type || m.messageType || '')}</div></div>`).join('') || '<p class="muted">Sem mensagens.</p>'}</div>${a ? `<div class="setting-block"><h4>Candidatos extraídos</h4>${(a.candidates || []).map(item => `<div class="notice" style="margin-top:8px"><div><strong>${esc(item.key)}</strong>: ${esc(item.value)}</div><div class="muted">confidence=${esc(item.confidence)} · status=${esc(item.resolution_status || item.resolutionStatus)} · source=${esc(item.source_message_id || item.sourceMessageId || 'UNKNOWN')}</div></div>`).join('') || '<p class="muted">Nenhum candidato.</p>'}</div>` : ''}`; }
  async function loadConversations() { try { const result = await api('/api/whatsapp/conversations?limit=100'); state.conversations = Array.isArray(result) ? result : result.conversations || []; const first = state.conversations[0]; if (!state.selectedJid && first) state.selectedJid = first.externalThreadId || first.jid || null; if (state.selectedJid) await loadContext(); renderFeaturePageSync(); } catch(error) { state.error = error instanceof Error ? error.message : String(error); renderFeaturePageSync(); } }
  async function loadContext() { if (!state.selectedJid) return; state.context = await api(`/api/whatsapp/conversation-context?jid=${encodeURIComponent(state.selectedJid)}&limit=100`); }
  function bindConversations() { $('#conversation-refresh')?.addEventListener('click', loadConversations); document.querySelectorAll('[data-conversation-jid]').forEach(button => button.addEventListener('click', async () => { state.selectedJid = button.dataset.conversationJid; state.analysis = null; await loadContext(); renderFeaturePageSync(); })); $('#conversation-context-refresh')?.addEventListener('click', async () => { await loadContext(); renderFeaturePageSync(); }); $('#conversation-analyze')?.addEventListener('click', async () => { try { state.analysis = await api(`/api/whatsapp/conversation-analysis?jid=${encodeURIComponent(state.selectedJid)}&limit=500`); renderFeaturePageSync(); toast('Análise concluída com proveniência.'); } catch(error) { toast(error instanceof Error ? error.message : String(error)); } }); }

  function broadcastsView() { return `<div class="toolbar"><div><h2>Disparos</h2><p class="muted">Importe, valide e revise os contatos. Nenhum envio ocorre antes da confirmação humana.</p></div><span class="badge info">BATCHDISPATCH</span></div><section class="card"><div class="card-body"><div class="tabs"><button class="tab ${state.dispatchMode === 'csv' ? 'active' : ''}" data-dispatch-mode="csv">CSV</button><button class="tab ${state.dispatchMode === 'manual' ? 'active' : ''}" data-dispatch-mode="manual">Manual</button></div><div style="margin-top:18px">${state.dispatchMode === 'csv' ? '<div class="csv-zone"><h3>Arquivo CSV</h3><p>Colunas aceitas: telefone ou number; nome e contexto são opcionais.</p><input id="dispatch-file" type="file" accept=".csv,text/csv" /></div>' : `<div class="grid grid-3">${field('Número','manual-number')}${field('Nome opcional','manual-name')}${field('Contexto opcional','manual-context')}</div><div class="actions" style="margin-top:12px"><button class="btn primary" id="manual-preview">Validar contato</button></div>`}</div><div id="dispatch-preview" style="margin-top:16px">${state.dispatchPreview ? dispatchPreviewView() : ''}</div></div></section>${state.dispatchBatch ? `<section class="card" style="margin-top:16px"><div class="card-body"><div class="section-title"><h3>Batch ${esc(state.dispatchBatch.id)}</h3><span class="badge info">${esc(state.dispatchBatch.status || 'UNKNOWN')}</span></div><p class="muted">O efeito externo depende de confirmação e ação de fila.</p><div class="actions"><button class="btn" id="dispatch-confirm">Confirmar</button><button class="btn primary" id="dispatch-queue">Colocar na fila</button></div></div></section>` : ''}`; }
  function dispatchPreviewView() { const p = state.dispatchPreview; const contacts = p.contacts || p.rows || []; return `<div class="notice"><div><strong>Preview ${esc(p.status || '')}</strong><div>${esc(contacts.length)} contatos</div><div class="muted">Nada foi enviado. A confirmação humana é obrigatória.</div></div></div><div class="preview"><div class="card-body"><div class="table-wrap"><table class="table"><thead><tr><th>Número</th><th>Nome</th><th>Contexto</th><th>Estado</th></tr></thead><tbody>${contacts.slice(0,50).map(row => `<tr><td>${esc(row.number || row.phone || row.normalized || '')}</td><td>${esc(row.name || '')}</td><td>${esc(row.context || row.observation || '')}</td><td>${esc(row.status || 'VALID')}</td></tr>`).join('')}</tbody></table></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="dispatch-create-batch">Criar batch</button></div></div></div>`; }
  function bindBroadcasts() {
    document.querySelectorAll('[data-dispatch-mode]').forEach(button => button.addEventListener('click', () => { state.dispatchMode = button.dataset.dispatchMode; state.dispatchPreview = null; renderFeaturePageSync(); }));
    $('#dispatch-file')?.addEventListener('change', async () => { const file = $('#dispatch-file').files?.[0]; if (!file) return; try { state.dispatchPreview = await api('/api/whatsapp/dispatch/preview/csv', { method:'POST', body: JSON.stringify({ csv: await file.text() }) }); renderFeaturePageSync(); } catch(error) { toast(error instanceof Error ? error.message : String(error)); } });
    $('#manual-preview')?.addEventListener('click', async () => { try { state.dispatchPreview = await api('/api/whatsapp/dispatch/preview/manual', { method:'POST', body: JSON.stringify({ contacts:[{ number: $('#manual-number').value, name: $('#manual-name').value, context: $('#manual-context').value }] }) }); renderFeaturePageSync(); } catch(error) { toast(error instanceof Error ? error.message : String(error)); } });
    $('#dispatch-create-batch')?.addEventListener('click', async () => { try { state.dispatchBatch = (await api('/api/whatsapp/dispatch/batches', { method:'POST', body: JSON.stringify({ preview: state.dispatchPreview }) })).batch; toast('Batch criado. Nenhum envio iniciado.'); renderFeaturePageSync(); } catch(error) { toast(error instanceof Error ? error.message : String(error)); } });
    $('#dispatch-confirm')?.addEventListener('click', async () => { if (!state.dispatchBatch) return; try { state.dispatchBatch = (await api(`/api/whatsapp/dispatch/batches/${encodeURIComponent(state.dispatchBatch.id)}`, { method:'POST', body: JSON.stringify({ action:'confirm', fingerprint:state.dispatchBatch.fingerprint, recipient_count:state.dispatchBatch.recipientCount, confirmed_at:new Date().toISOString() }) })).batch; toast('Batch confirmado.'); renderFeaturePageSync(); } catch(error) { toast(error instanceof Error ? error.message : String(error)); } });
    $('#dispatch-queue')?.addEventListener('click', async () => { if (!state.dispatchBatch) return; try { state.dispatchBatch = (await api(`/api/whatsapp/dispatch/batches/${encodeURIComponent(state.dispatchBatch.id)}`, { method:'POST', body: JSON.stringify({ action:'queue' }) })).batch; toast('Batch colocado na fila autorizada.'); renderFeaturePageSync(); } catch(error) { toast(error instanceof Error ? error.message : String(error)); } });
  }

  function start() { interceptNavigation(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true }); else start();
})();