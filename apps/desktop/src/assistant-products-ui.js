(() => {
  const GATEWAY = 'http://127.0.0.1:3210';
  const original = { main: null };
  const state = {
    page: null,
    assistant: null,
    products: [],
    productEditing: null,
    conversations: [],
    selectedJid: null,
    context: null,
    analysis: null,
    dispatchPreview: null,
    dispatchBatch: null,
    dispatchMode: 'csv',
    loading: false,
    error: null,
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>\"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[char]));
  const main = () => $('#main');
  const toast = text => {
    const root = $('#toast-root');
    if (!root) return;
    root.innerHTML = `<div class="toast" role="status">${esc(text)}</div>`;
    setTimeout(() => { root.innerHTML = ''; }, 3000);
  };
  async function api(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${GATEWAY}${path}`, {
        ...options,
        headers: { 'content-type': 'application/json', ...(options.headers || {}) },
        signal: controller.signal,
      });
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
    return `<div class="field"><label for="${id}">${esc(label)}</label><select id="${id}">${options.map(([v,l]) => `<option value="${esc(v)}" ${v===value?'selected':''}>${esc(l)}</option>`).join('')}</select></div>`;
  }

  function interceptNavigation() {
    if (document.__kassistFeatureUiBound) return;
    document.__kassistFeatureUiBound = true;
    document.addEventListener('click', event => {
      const button = event.target.closest?.('[data-page]');
      if (!button) return;
      const page = button.dataset.page;
      if (!['assistant','products','conversations','broadcasts','settings'].includes(page)) return;
      if (page === 'settings') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      state.page = page;
      renderFeaturePage();
    }, true);
  }

  async function renderFeaturePage() {
    const target = main();
    if (!target || !state.page) return;
    state.error = null;
    if (state.page === 'assistant') { target.innerHTML = assistantView(); bindAssistant(); await loadAssistant(); return; }
    if (state.page === 'products') { target.innerHTML = productsView(); bindProducts(); await loadProducts(); return; }
    if (state.page === 'conversations') { target.innerHTML = conversationsView(); bindConversations(); await loadConversations(); return; }
    if (state.page === 'broadcasts') { target.innerHTML = broadcastsView(); bindBroadcasts(); }
  }

  function assistantView() {
    const c = state.assistant || {};
    const llm = c.llm || {};
    return `<div class="toolbar"><div><h2>Assistente / IA</h2><p class="muted">Configuração estruturada persistida e compilada pelo runtime.</p></div><div class="actions"><span class="badge ${c.autoReplyEnabled ? 'ok' : 'neutral'}">${c.autoReplyEnabled ? 'AUTO-REPLY ATIVO' : 'AUTO-REPLY DESATIVADO'}</span></div></div>
    ${state.error ? `<div class="notice error"><div class="notice-icon">!</div><div>${esc(state.error)}</div></div>` : ''}
    <section class="card"><div class="card-body"><div class="grid grid-2">
      ${field('Nome do assistente','assistantName',c.assistantName)}
      ${field('Empresa / negócio','businessName',c.businessName)}
      ${field('Função','role',c.role)}
      ${selectField('Idioma','language',c.language,[['pt-BR','Português (Brasil)'],['pt-PT','Português (Portugal)'],['en-US','English (US)'],['es-ES','Español']])}
      ${field('Personalidade','personality',c.personality)}
      ${field('Tom de voz','toneOfVoice',c.toneOfVoice)}
      ${selectField('Formato da resposta','responseFormat',c.responseFormat,[['natural','Natural / conversacional'],['concise','Objetivo / curto'],['structured','Estruturado']])}
      ${selectField('Cobrança de entrega','deliveryFeePolicy',c.deliveryFeePolicy,[['UNKNOWN','Não definido'],['FREE','Frete grátis'],['FIXED','Taxa fixa'],['CALCULATED','Calculada conforme regra']])}
      ${field('Modelo Ollama','llmModel',llm.model)}
      ${field('Endpoint local','llmBaseUrl',llm.baseUrl,'text','readonly')}
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      ${area('Regras comerciais','commercialRules',c.commercialRules)}
      ${area('Política / orientações de entrega','deliveryInstructions',c.deliveryInstructions)}
      ${area('Horário de atendimento','businessHours',c.businessHours)}
      ${area('Instruções de comportamento','behaviorInstructions',c.behaviorInstructions)}
      ${area('Limitações do assistente','limitations',c.limitations)}
    </div>
    <div class="setting-row" style="margin-top:16px"><div><strong>Atendimento automático</strong><div class="muted">Novas mensagens podem acionar o pipeline LLM → outbound.</div></div><select id="autoReplyEnabled"><option value="false" ${c.autoReplyEnabled?'':'selected'}>Desativado</option><option value="true" ${c.autoReplyEnabled?'selected':''}>Ativado</option></select></div>
    <div class="actions" style="margin-top:18px"><button class="btn" id="assistant-prompt">Visualizar prompt compilado</button><button class="btn primary" id="assistant-save">Salvar configuração</button></div>
    <div id="assistant-prompt-output" style="margin-top:16px"></div></div></section>`;
  }

  async function loadAssistant() {
    try { state.assistant = await api('/api/assistant/config'); renderFeaturePageSync(); }
    catch (error) { state.error = error instanceof Error ? error.message : String(error); renderFeaturePageSync(); }
  }
  function renderFeaturePageSync() { if (state.page === 'assistant') { main().innerHTML = assistantView(); bindAssistant(); } }
  function bindAssistant() {
    $('#assistant-save')?.addEventListener('click', async () => {
      const body = {
        assistantName: $('#assistantName')?.value,
        businessName: $('#businessName')?.value,
        role: $('#role')?.value,
        personality: $('#personality')?.value,
        toneOfVoice: $('#toneOfVoice')?.value,
        language: $('#language')?.value,
        responseFormat: $('#responseFormat')?.value,
        commercialRules: $('#commercialRules')?.value,
        deliveryFeePolicy: $('#deliveryFeePolicy')?.value,
        deliveryInstructions: $('#deliveryInstructions')?.value,
        businessHours: $('#businessHours')?.value,
        behaviorInstructions: $('#behaviorInstructions')?.value,
        limitations: $('#limitations')?.value,
        llm: { model: $('#llmModel')?.value?.trim(), baseUrl: $('#llmBaseUrl')?.value },
        autoReplyEnabled: $('#autoReplyEnabled')?.value === 'true',
      };
      try { state.assistant = await api('/api/assistant/config',{method:'PUT',body:JSON.stringify(body)}); toast('Configuração do assistente salva.'); renderFeaturePageSync(); }
      catch (error) { state.error = error instanceof Error ? error.message : String(error); renderFeaturePageSync(); }
    });
    $('#assistant-prompt')?.addEventListener('click', async () => {
      try { const result = await api('/api/assistant/prompt'); $('#assistant-prompt-output').innerHTML = `<div class="notice"><div class="notice-icon">✓</div><div><strong>Prompt v${esc(result.promptVersion || 'UNKNOWN')}</strong><pre class="mono" style="white-space:pre-wrap;margin:10px 0 0">${esc(result.systemPrompt || '')}</pre></div></div>`; }
      catch (error) { toast(error instanceof Error ? error.message : String(error)); }
    });
  }

  function productsView() {
    return `<div class="toolbar"><div><h2>Produtos</h2><p class="muted">Catálogo persistido no SQLite. Preços em centavos e estoque com estado explícito.</p></div><div class="actions"><button class="btn primary" id="product-new">Adicionar produto</button><button class="btn" id="product-refresh">Atualizar</button></div></div>
    ${state.error ? `<div class="notice error"><div class="notice-icon">!</div><div>${esc(state.error)}</div></div>` : ''}
    <section class="card"><div class="card-body"><div class="table-wrap"><table class="table"><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Disponibilidade</th><th></th></tr></thead><tbody>${state.products.length ? state.products.map(productRow).join('') : `<tr><td colspan="6"><div class="empty-state"><h3>Nenhum produto</h3><p>Crie o primeiro produto do catálogo.</p></div></td></tr>`}</tbody></table></div></div></section>`;
  }
  function productRow(p) { return `<tr class="row-hover"><td><strong>${esc(p.name)}</strong><div class="muted">${esc(p.description || '')}</div></td><td>${esc(p.category || 'Sem categoria')}</td><td>R$ ${(Number(p.priceCents||0)/100).toFixed(2).replace('.',',')}</td><td>${esc(p.stockQuantity)}</td><td>${p.available ? '<span class="badge ok">DISPONÍVEL</span>' : '<span class="badge neutral">INDISPONÍVEL</span>'}</td><td><div class="actions"><button class="btn" data-product-edit="${esc(p.id)}">Editar</button><button class="btn danger" data-product-delete="${esc(p.id)}">Remover</button></div></td></tr>`; }
  async function loadProducts() { try { const result = await api('/api/products'); state.products = Array.isArray(result) ? result : result.products || []; main().innerHTML = productsView(); bindProducts(); } catch(error) { state.error=error instanceof Error?error.message:String(error); main().innerHTML=productsView(); bindProducts(); } }
  function bindProducts() {
    $('#product-refresh')?.addEventListener('click',loadProducts);
    $('#product-new')?.addEventListener('click',() => productDialog());
    document.querySelectorAll('[data-product-edit]').forEach(b=>b.addEventListener('click',()=>productDialog(state.products.find(p=>p.id===b.dataset.productEdit))));
    document.querySelectorAll('[data-product-delete]').forEach(b=>b.addEventListener('click',async()=>{const product=state.products.find(p=>p.id===b.dataset.productDelete);if(!product)return;if(!window.confirm(`Remover o produto "${product.name}"?`))return;try{await api(`/api/products/${encodeURIComponent(product.id)}`,{method:'DELETE'});toast('Produto removido.');await loadProducts()}catch(error){toast(error instanceof Error?error.message:String(error))}}));
  }
  function productDialog(product = null) {
    const p=product||{}; const root=$('#dialog-root'); root.innerHTML=`<div class="dialog-backdrop"><section class="dialog" role="dialog" aria-modal="true"><div class="section-title"><h3>${product?'Editar produto':'Novo produto'}</h3><button class="btn" id="product-dialog-close">Fechar</button></div><div class="grid grid-2">${field('Nome','p-name',p.name)}${field('Preço (R$)','p-price',p.priceCents ? (Number(p.priceCents)/100).toFixed(2) : '','number','step="0.01" min="0"')}${field('Categoria','p-category',p.category)}${field('Estoque','p-stock',p.stockQuantity ?? 0,'number','step="1" min="0"')}${selectField('Disponibilidade','p-available',p.available===false?'false':'true',[['true','Disponível'],['false','Indisponível']])}</div><div style="margin-top:12px">${area('Descrição','p-description',p.description||'')}${field('Referência da foto','p-image',p.imageReference||'','text','placeholder="caminho/referência local"')}</div><div class="actions" style="margin-top:16px"><button class="btn primary" id="product-dialog-save">Salvar</button></div></section></div>`; $('#product-dialog-close').onclick=()=>root.innerHTML=''; $('#product-dialog-save').onclick=async()=>{const body={name:$('#p-name').value,priceCents:Math.round(Number($('#p-price').value)*100),category:$('#p-category').value,stockQuantity:Number($('#p-stock').value),available:$('#p-available').value==='true',description:$('#p-description').value,imageReference:$('#p-image').value||null};try{if(product)await api(`/api/products/${encodeURIComponent(product.id)}`,{method:'PUT',body:JSON.stringify(body)});else await api('/api/products',{method:'POST',body:JSON.stringify(body)});root.innerHTML='';toast('Produto salvo.');await loadProducts()}catch(error){toast(error instanceof Error?error.message:String(error))}};
  }

  function conversationsView() { return `<div class="toolbar"><div><h2>Conversas</h2><p class="muted">Contexto persistido por conversa, análise auditável e histórico real.</p></div><div class="actions"><button class="btn" id="conversation-refresh">Atualizar</button></div></div><section class="card"><div class="card-body"><div class="grid grid-2"><div><h3 style="margin-top:0">Conversas persistidas</h3><div id="conversation-list">${state.conversations.length?state.conversations.map(c=>`<button class="conversation-row ${c.jid===state.selectedJid?'active':''}" data-conversation-jid="${esc(c.jid)}"><div class="row-top"><span class="row-name">${esc(c.name||c.jid)}</span><span class="row-time">${esc(c.updatedAt||'')}</span></div><div class="row-preview">${esc(c.lastMessage||'')}</div></button>`).join(''):'<div class="empty-state"><h3>Nenhuma conversa persistida</h3><p>O banco ainda não possui conversas disponíveis.</p></div>'}</div></div><div><div id="conversation-detail">${state.selectedJid?conversationDetail():'<div class="empty-state"><h3>Selecione uma conversa</h3><p>O contexto e a análise aparecerão aqui.</p></div>'}</div></div></div></div></section>`; }
  function conversationDetail(){const ctx=state.context||{},a=state.analysis;return `<div class="section-title"><div><h3>${esc(ctx.customer?.name||state.selectedJid)}</h3><div class="mono muted">${esc(state.selectedJid)}</div></div><div class="actions"><button class="btn" id="conversation-context-refresh">Recarregar contexto</button><button class="btn primary" id="conversation-analyze">Analisar conversa</button></div></div><div class="grid grid-2"><section class="notice"><div><strong>Customer</strong><div>${esc(ctx.customer?.name||'UNKNOWN')}</div><div class="mono">${esc(ctx.customer?.phone||'UNKNOWN')}</div></div></section><section class="notice"><div><strong>Estado</strong><div>${esc(ctx.currentState||'UNKNOWN')}</div></div></section></div><div class="setting-block"><h4>Histórico</h4>${(ctx.messages||[]).map(m=>`<div style="padding:9px 0;border-bottom:1px solid var(--line)"><span class="badge ${m.direction==='OUTBOUND'?'info':'neutral'}">${esc(m.direction)}</span> ${esc(m.text||'[sem texto]')}<div class="muted" style="font-size:10px">${esc(m.id||'')} · ${esc(m.source||'PERSISTED')}</div></div>`).join('')||'<p class="muted">Sem mensagens.</p>'}</div>${a?`<div class="setting-block"><h4>Candidatos extraídos</h4>${(a.candidates||[]).map(item=>`<div class="notice" style="margin-top:8px"><div><strong>${esc(item.key)}</strong>: ${esc(item.value)}</div><div class="muted">confidence=${esc(item.confidence)} · status=${esc(item.resolution_status)} · source=${esc(item.source_message_id||'UNKNOWN')}</div></div>`).join('')||'<p class="muted">Nenhum candidato.</p>'}</div>`:''}`; }
  async function loadConversations(){try{const result=await api('/api/whatsapp/conversations?limit=100');state.conversations=Array.isArray(result)?result:result.conversations||[];if(!state.selectedJid&&state.conversations[0])state.selectedJid=state.conversations[0].jid; if(state.selectedJid)await loadContext();renderFeaturePageSync()}catch(error){state.error=error instanceof Error?error.message:String(error);renderFeaturePageSync()}}
  async function loadContext(){if(!state.selectedJid)return;state.context=await api(`/api/whatsapp/conversation-context?jid=${encodeURIComponent(state.selectedJid)}&limit=100`)}
  function bindConversations(){ $('#conversation-refresh')?.addEventListener('click',loadConversations);document.querySelectorAll('[data-conversation-jid]').forEach(b=>b.addEventListener('click',async()=>{state.selectedJid=b.dataset.conversationJid;state.analysis=null;await loadContext();renderFeaturePageSync()}));$('#conversation-context-refresh')?.addEventListener('click',async()=>{await loadContext();renderFeaturePageSync()});$('#conversation-analyze')?.addEventListener('click',async()=>{try{state.analysis=await api(`/api/whatsapp/conversation-analysis?jid=${encodeURIComponent(state.selectedJid)}&limit=500`);renderFeaturePageSync();toast('Análise concluída com proveniência.')}catch(error){toast(error instanceof Error?error.message:String(error))}})}

  function broadcastsView(){return `<div class="toolbar"><div><h2>Disparos</h2><p class="muted">Importe contatos, revise o preview, confirme humanamente e só então coloque o batch na fila.</p></div><span class="badge info">BATCHDISPATCH</span></div><section class="card"><div class="card-body"><div class="tabs"><button class="tab ${state.dispatchMode==='csv'?'active':''}" data-dispatch-mode="csv">CSV</button><button class="tab ${state.dispatchMode==='manual'?'active':''}" data-dispatch-mode="manual">Manual</button></div><div style="margin-top:18px">${state.dispatchMode==='csv'?`<div class="csv-zone"><h3>Arquivo CSV</h3><p>Colunas aceitas: telefone ou number; nome e contexto são opcionais.</p><input id="dispatch-file" type="file" accept=".csv,text/csv" /></div>`:`<div class="grid grid-3">${field('Número','manual-number')}${field('Nome opcional','manual-name')}${field('Contexto opcional','manual-context')}</div><div class="actions" style="margin-top:12px"><button class="btn primary" id="manual-preview">Validar contato</button></div>`}</div><div id="dispatch-preview" style="margin-top:16px">${state.dispatchPreview?dispatchPreviewView():''}</div></div></section>${state.dispatchBatch?`<section class="card" style="margin-top:16px"><div class="card-body"><div class="section-title"><h3>Batch ${esc(state.dispatchBatch.id)}</h3>${badge(state.dispatchBatch.status)}</div><p class="muted">O envio somente começa após confirmação e ação de fila.</p><div class="actions"><button class="btn" id="dispatch-confirm">Confirmar</button><button class="btn primary" id="dispatch-queue">Colocar na fila</button></div></div></section>`:''}`}
  function dispatchPreviewView(){const p=state.dispatchPreview;return `<div class="notice"><div><strong>Preview ${esc(p.status||'')}</strong><div>${esc(p.rows?.length||p.contacts?.length||0)} contatos</div><div class="muted">Nada foi enviado. A confirmação humana é obrigatória.</div></div></div><div class="preview"><div class="card-body"><div class="table-wrap"><table class="table"><thead><tr><th>Número</th><th>Nome</th><th>Contexto</th><th>Estado</th></tr></thead><tbody>${(p.contacts||p.rows||[]).slice(0,50).map(r=>`<tr><td>${esc(r.number||r.phone||r.normalized||'')}</td><td>${esc(r.name||'')}</td><td>${esc(r.context||r.observation||'')}</td><td>${esc(r.status||'VALID')}</td></tr>`).join('')}</tbody></table></div><div class="actions" style="margin-top:12px"><button class="btn primary" id="dispatch-create-batch">Criar batch</button></div></div></div>`}
  function bindBroadcasts(){document.querySelectorAll('[data-dispatch-mode]').forEach(b=>b.addEventListener('click',()=>{state.dispatchMode=b.dataset.dispatchMode;state.dispatchPreview=null;renderFeaturePageSync()}));$('#dispatch-file')?.addEventListener('change',async()=>{const file=$('#dispatch-file').files?.[0];if(!file)return;try{const csv=await file.text();state.dispatchPreview=await api('/api/whatsapp/dispatch/preview/csv',{method:'POST',body:JSON.stringify({csv})});renderFeaturePageSync();}catch(error){toast(error instanceof Error?error.message:String(error))}});$('#manual-preview')?.addEventListener('click',async()=>{try{state.dispatchPreview=await api('/api/whatsapp/dispatch/preview/manual',{method:'POST',body:JSON.stringify({contacts:[{number:$('#manual-number').value,name:$('#manual-name').value,context:$('#manual-context').value}]})});renderFeaturePageSync()}catch(error){toast(error instanceof Error?error.message:String(error))}});$('#dispatch-create-batch')?.addEventListener('click',async()=>{try{state.dispatchBatch=(await api('/api/whatsapp/dispatch/batches',{method:'POST',body:JSON.stringify({preview:state.dispatchPreview})})).batch;toast('Batch criado em estado inicial. Nenhum envio iniciado.');renderFeaturePageSync()}catch(error){toast(error instanceof Error?error.message:String(error))}});$('#dispatch-confirm')?.addEventListener('click',async()=>{if(!state.dispatchBatch)return;try{state.dispatchBatch=(await api(`/api/whatsapp/dispatch/batches/${encodeURIComponent(state.dispatchBatch.id)}`,{method:'POST',body:JSON.stringify({action:'confirm',fingerprint:state.dispatchBatch.fingerprint,recipient_count:state.dispatchBatch.recipientCount,confirmed_at:new Date().toISOString()})})).batch;toast('Batch confirmado.');renderFeaturePageSync()}catch(error){toast(error instanceof Error?error.message:String(error))}});$('#dispatch-queue')?.addEventListener('click',async()=>{if(!state.dispatchBatch)return;try{state.dispatchBatch=(await api(`/api/whatsapp/dispatch/batches/${encodeURIComponent(state.dispatchBatch.id)}`,{method:'POST',body:JSON.stringify({action:'queue'})})).batch;toast('Batch enviado para a fila autorizada.');renderFeaturePageSync()}catch(error){toast(error instanceof Error?error.message:String(error))}})}

  function start(){interceptNavigation();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
