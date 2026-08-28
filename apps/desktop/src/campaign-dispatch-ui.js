(() => {
  const GATEWAY = 'http://127.0.0.1:3210';
  const state = {
    csvPreview: null,
    manualPreview: null,
    objective: '',
    messages: [{ text: '' }],
    images: [],
    captionPolicy: 'NO_IMAGE',
    minSeconds: 0,
    minMilliseconds: 0,
    maxSeconds: 0,
    maxMilliseconds: 0,
    preview: null,
    draft: null,
    campaigns: [],
    error: null,
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>\"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[char]));
  const main = () => document.querySelector('#main');

  async function api(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${GATEWAY}${path}`, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) }, signal: controller.signal });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : body.error?.message || `Falha HTTP ${response.status}`);
      return body;
    } finally { clearTimeout(timer); }
  }

  function totalMs(secondsId, millisecondsId) {
    const seconds = Number($(secondsId)?.value ?? 0);
    const milliseconds = Number($(millisecondsId)?.value ?? 0);
    if (!Number.isInteger(seconds) || seconds < 0 || !Number.isInteger(milliseconds) || milliseconds < 0 || milliseconds > 999) throw new Error('Intervalo inválido. Use segundos inteiros e milissegundos entre 0 e 999.');
    return seconds * 1000 + milliseconds;
  }

  function messages() {
    return state.messages.map((entry, index) => `<div class="card" style="padding:14px"><div class="section-title"><strong>Variação ${index + 1}</strong>${state.messages.length > 1 ? `<button class="btn danger" type="button" data-remove-message="${index}">Remover</button>` : ''}</div><textarea data-message-index="${index}" aria-label="Variação ${index + 1}" placeholder="Digite a mensagem desta variação...">${esc(entry.text)}</textarea></div>`).join('');
  }

  function images() {
    if (!state.images.length) return '<div class="empty-state"><div class="empty-icon">＋</div><h3>Nenhuma imagem adicionada</h3><p>O envio de imagem é opcional. Os arquivos selecionados são copiados para o armazenamento controlado do Desktop.</p></div>';
    return state.images.map((image, index) => `<div class="card" style="padding:14px"><div class="row-top"><div><strong>Imagem ${index + 1}</strong><div class="muted">${esc(image.filename || image.reference)}</div></div><button class="btn danger" type="button" data-remove-image="${index}">Remover</button></div><div class="muted mono" style="margin-top:8px">${esc(image.reference)}</div></div>`).join('');
  }

  function recipientSummary() {
    const csv = state.csvPreview?.recipients || [];
    const manual = state.manualPreview?.recipients || [];
    return { csv, manual, merged: [...csv, ...manual] };
  }

  function render() {
    const target = main();
    if (!target) return;
    const recipients = recipientSummary();
    const canPreview = recipients.merged.length > 0 && Boolean(state.objective.trim());
    const canCreate = Boolean(state.preview);
    const canConfirm = Boolean(state.draft && state.draft.batch?.state === 'DRAFT');
    const canQueue = Boolean(state.draft && state.draft.batch?.state === 'CONFIRMED');
    target.innerHTML = `<div class="toolbar"><div><h2>Disparos</h2><p class="muted">Campaign Dispatch profissional: PREVIEW → confirmação humana → Batch → Queue → Processing.</p></div><div class="kpis"><span class="badge info">${recipients.merged.length} destinatários</span><span class="badge ${state.preview ? 'ok' : 'neutral'}">${state.preview ? 'PREVIEW PRONTO' : 'CONFIGURAÇÃO'}</span></div></div>${state.error ? `<div class="notice error" style="margin-bottom:16px"><div class="notice-icon">!</div><div>${esc(state.error)}</div></div>` : ''}

      <section class="card"><div class="card-body"><div class="section-title"><div><h3>1. Destinatários</h3><p class="muted">CSV e contatos manuais alimentam o mesmo pipeline de normalização e duplicidade.</p></div></div>
        <div class="grid grid-2">
          <div class="csv-zone"><h3>Escolher arquivo CSV</h3><p>Colunas aceitas: phone, telefone, number, numero, whatsapp. Nome e contexto são opcionais.</p><input id="campaign-csv" class="sr-only" type="file" accept=".csv,text/csv"><button class="btn primary" id="campaign-csv-pick">Selecionar CSV</button>${state.csvPreview ? `<div class="notice" style="margin-top:12px"><div class="notice-icon">✓</div><div><strong>${state.csvPreview.recipientCount} contatos válidos</strong><div>${state.csvPreview.invalid?.length || 0} linhas rejeitadas/duplicadas.</div></div></div>` : ''}</div>
          <div class="field"><label for="campaign-manual">Digite aqui os contatos separados por vírgula</label><textarea id="campaign-manual" placeholder="5511999990001, 5511999990002" style="min-height:180px"></textarea><small>Os números serão normalizados e deduplicados pelo mesmo endpoint usado pelo CSV.</small>${state.manualPreview ? `<div class="notice" style="margin-top:10px"><div class="notice-icon">✓</div><div><strong>${state.manualPreview.recipientCount} contatos manuais válidos</strong></div></div>` : ''}</div>
        </div>
        <div class="actions" style="margin-top:14px"><button class="btn" id="campaign-manual-preview">Validar contatos manuais</button></div>
      </div></section>

      <section class="card" style="margin-top:16px"><div class="card-body"><div class="section-title"><div><h3>2. Objetivo da campanha</h3><p class="muted">Contexto operacional para a campanha; não é enviado automaticamente ao cliente e não concede autoridade adicional à LLM.</p></div></div><div class="field"><label for="campaign-objective">Objetivo do disparo</label><textarea id="campaign-objective" placeholder="Ex.: iniciar contato com clientes que demonstraram interesse, apresentar a nova linha e continuar a conversa de forma natural, sem inventar informações." required>${esc(state.objective)}</textarea></div></div></section>

      <section class="card" style="margin-top:16px"><div class="card-body"><div class="section-title"><div><h3>3. Mensagens</h3><p class="muted">A variante escolhida é persistida por destinatário e permanece a mesma em retry.</p></div><button class="btn" id="campaign-add-message" type="button">＋ Adicionar variação</button></div><div style="display:grid;gap:10px">${messages()}</div></div></section>

      <section class="card" style="margin-top:16px"><div class="card-body"><div class="section-title"><div><h3>4. Imagens</h3><p class="muted">Assets são referências persistidas no armazenamento controlado; o batch não recebe base64.</p></div><button class="btn" id="campaign-add-image" type="button">＋ Adicionar imagem</button></div><div style="display:grid;gap:10px">${images()}</div></div></section>

      <section class="card" style="margin-top:16px"><div class="card-body"><div class="section-title"><div><h3>5. Legenda</h3><p class="muted">A política define se a imagem é enviada sem legenda ou com a variante textual como caption.</p></div></div>${`<div class="grid grid-2"><div class="field"><label for="campaign-caption">Política de envio</label><select id="campaign-caption"><option value="NO_IMAGE" ${state.captionPolicy === 'NO_IMAGE' ? 'selected' : ''}>Sem imagem</option><option value="IMAGE_WITHOUT_CAPTION" ${state.captionPolicy === 'IMAGE_WITHOUT_CAPTION' ? 'selected' : ''}>Imagem sem legenda</option><option value="IMAGE_WITH_MESSAGE_CAPTION" ${state.captionPolicy === 'IMAGE_WITH_MESSAGE_CAPTION' ? 'selected' : ''}>Imagem com mensagem como legenda</option></select></div><div class="notice"><div class="notice-icon">i</div><div><strong>Sem duplicidade de texto</strong><div>Quando a mensagem virar legenda, ela não é enviada também como uma segunda mensagem.</div></div></div></div>`}</div></section>

      <section class="card" style="margin-top:16px"><div class="card-body"><div class="section-title"><div><h3>6. Intervalo entre disparos</h3><p class="muted">Pacing operacional persistido em milissegundos. Retry backoff continua separado no BatchDispatchRuntime.</p></div></div><div class="grid grid-4"><div class="field"><label for="campaign-min-s">Mínimo — segundos</label><input id="campaign-min-s" type="number" min="0" step="1" value="${state.minSeconds}"></div><div class="field"><label for="campaign-min-ms">Mínimo — ms</label><input id="campaign-min-ms" type="number" min="0" max="999" step="1" value="${state.minMilliseconds}"></div><div class="field"><label for="campaign-max-s">Máximo — segundos</label><input id="campaign-max-s" type="number" min="0" step="1" value="${state.maxSeconds}"></div><div class="field"><label for="campaign-max-ms">Máximo — ms</label><input id="campaign-max-ms" type="number" min="0" max="999" step="1" value="${state.maxMilliseconds}"></div></div></div></section>

      <section class="card" style="margin-top:16px"><div class="card-body"><div class="section-title"><div><h3>7. Preview</h3><p class="muted">Nenhum efeito externo é produzido ao preencher o formulário, selecionar arquivo ou fechar o preview.</p></div><button class="btn primary" id="campaign-preview" ${canPreview ? '' : 'disabled'}>Gerar PREVIEW</button></div>${state.preview ? `<div class="grid grid-4"><div><div class="muted">Destinatários</div><strong>${state.preview.recipientCount}</strong></div><div><div class="muted">Mensagens</div><strong>${state.preview.campaign.messageVariants.length}</strong></div><div><div class="muted">Imagens</div><strong>${state.preview.campaign.imageVariants.length}</strong></div><div><div class="muted">Fingerprint</div><strong class="mono">${esc(state.preview.fingerprint.slice(0,16))}…</strong></div></div><div class="notice" style="margin-top:12px"><div class="notice-icon">✓</div><div><strong>Snapshot candidato</strong><div>Objetivo, recipients, variantes, caption e pacing estão incluídos no fingerprint.</div></div></div>` : '<div class="empty-state"><div class="empty-icon">○</div><h3>Preview ainda não gerado</h3><p>Valide ao menos um destinatário e informe o objetivo para continuar.</p></div>'}</div></section>

      ${state.preview ? `<section class="card" style="margin-top:16px"><div class="card-body"><div class="section-title"><div><h3>8. Confirmação humana</h3><p class="muted">A confirmação congela o snapshot efetivamente executado pelo Batch.</p></div><span class="badge ${canConfirm ? 'warn' : canQueue ? 'ok' : 'neutral'}">${esc(state.draft?.batch?.state || 'Aguardando confirmação')}</span></div><div class="actions"><button class="btn primary" id="campaign-create-draft" ${canCreate && !state.draft ? '' : 'disabled'}>Criar Batch DRAFT</button><button class="btn primary" id="campaign-confirm" ${canConfirm ? '' : 'disabled'}>Confirmar campanha</button><button class="btn" id="campaign-queue" ${canQueue ? '' : 'disabled'}>Queue / Executar</button>${state.draft ? `<button class="btn danger" id="campaign-cancel">Cancelar</button>` : ''}</div>${state.draft ? `<div class="notice" style="margin-top:12px"><div class="notice-icon">✓</div><div><strong>Batch ${esc(state.draft.batch.batchId)}</strong><div>Estado: ${esc(state.draft.batch.state)} · fingerprint: <span class="mono">${esc(state.draft.fingerprint)}</span></div></div></div>` : ''}</div></section>` : ''}

      <section class="card" style="margin-top:16px"><div class="card-body"><div class="section-title"><div><h3>Execuções recentes</h3><p class="muted">Estados e resultados vêm do Gateway real.</p></div><button class="btn" id="campaign-refresh">Atualizar</button></div>${state.campaigns.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Batch</th><th>Estado</th><th>Destinatários</th><th>Mensagem/Imagem</th><th>Agendamento</th></tr></thead><tbody>${state.campaigns.map(item => `<tr><td class="mono">${esc(item.batch.batchId)}</td><td>${esc(item.batch.state)}</td><td>${esc(item.batch.preview.recipientCount)}</td><td>${esc(item.campaign.captionPolicy)}</td><td>${Object.values(item.selections || {}).map(s => `${s.scheduledDelayMs}ms`).join(', ')}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon">○</div><h3>Nenhuma campanha</h3><p>A primeira execução aparecerá aqui depois de criada.</p></div>'}</div></section>`;

    bind();
  }

  function bind() {
    $('#campaign-csv-pick')?.addEventListener('click', () => $('#campaign-csv')?.click());
    $('#campaign-csv')?.addEventListener('change', async event => {
      try {
        const file = event.target.files?.[0];
        if (!file) return;
        const csv = await file.text();
        state.csvPreview = await api('/api/whatsapp/dispatch/preview/csv', { method: 'POST', body: JSON.stringify({ csv }) });
        state.error = null;
      } catch (error) { state.error = error instanceof Error ? error.message : String(error); }
      render();
    });
    $('#campaign-manual-preview')?.addEventListener('click', async () => {
      try {
        const text = $('#campaign-manual')?.value || '';
        const contacts = text.split(',').map(number => number.trim()).filter(Boolean).map(number => ({ number }));
        if (!contacts.length) throw new Error('Informe pelo menos um contato manual.');
        state.manualPreview = await api('/api/whatsapp/dispatch/preview/manual', { method: 'POST', body: JSON.stringify({ contacts }) });
        state.error = null;
      } catch (error) { state.error = error instanceof Error ? error.message : String(error); }
      render();
    });
    $('#campaign-objective')?.addEventListener('input', event => { state.objective = event.target.value; });
    document.querySelectorAll('[data-message-index]').forEach(input => input.addEventListener('input', event => { state.messages[Number(event.target.dataset.messageIndex)].text = event.target.value; }));
    $('#campaign-add-message')?.addEventListener('click', () => { state.messages.push({ text: '' }); render(); });
    document.querySelectorAll('[data-remove-message]').forEach(button => button.addEventListener('click', () => { state.messages.splice(Number(button.dataset.removeMessage), 1); render(); }));
    $('#campaign-add-image')?.addEventListener('click', async () => {
      try {
        if (!window.kassist?.selectCampaignImage) throw new Error('Seletor de imagem de campanha indisponível no Desktop.');
        const result = await window.kassist.selectCampaignImage();
        if (!result || result.canceled) return;
        state.images.push({ reference: result.imageReference, filename: result.filename, mimeType: result.mimeType, size: result.size, metadata: { source: 'electron-native-picker' } });
        state.error = null;
      } catch (error) { state.error = error instanceof Error ? error.message : String(error); }
      render();
    });
    document.querySelectorAll('[data-remove-image]').forEach(button => button.addEventListener('click', () => { state.images.splice(Number(button.dataset.removeImage), 1); render(); }));
    $('#campaign-caption')?.addEventListener('change', event => { state.captionPolicy = event.target.value; render(); });
    $('#campaign-preview')?.addEventListener('click', createPreview);
    $('#campaign-create-draft')?.addEventListener('click', createDraft);
    $('#campaign-confirm')?.addEventListener('click', confirmCampaign);
    $('#campaign-queue')?.addEventListener('click', queueCampaign);
    $('#campaign-cancel')?.addEventListener('click', cancelCampaign);
    $('#campaign-refresh')?.addEventListener('click', loadCampaigns);
  }

  function capturePacing() {
    state.minSeconds = Number($('#campaign-min-s')?.value ?? 0);
    state.minMilliseconds = Number($('#campaign-min-ms')?.value ?? 0);
    state.maxSeconds = Number($('#campaign-max-s')?.value ?? 0);
    state.maxMilliseconds = Number($('#campaign-max-ms')?.value ?? 0);
    return {
      minimumMs: totalMs('#campaign-min-s', '#campaign-min-ms'),
      maximumMs: totalMs('#campaign-max-s', '#campaign-max-ms'),
    };
  }

  function payload() {
    const recipients = recipientSummary().merged;
    const messages = state.messages.map(entry => ({ text: String(entry.text ?? '').trim() })).filter(entry => entry.text);
    const pacingPolicy = capturePacing();
    if (pacingPolicy.maximumMs < pacingPolicy.minimumMs) throw new Error('O intervalo máximo deve ser maior ou igual ao mínimo.');
    if (!recipients.length) throw new Error('Adicione pelo menos um destinatário.');
    if (!state.objective.trim()) throw new Error('O objetivo da campanha é obrigatório.');
    if (state.captionPolicy === 'NO_IMAGE' && !messages.length) throw new Error('Adicione ao menos uma mensagem quando a campanha não usa imagem.');
    if (state.captionPolicy !== 'NO_IMAGE' && !state.images.length) throw new Error('Adicione ao menos uma imagem para uma política de imagem.');
    if (state.captionPolicy === 'IMAGE_WITH_MESSAGE_CAPTION' && !messages.length) throw new Error('Adicione ao menos uma mensagem para usar legenda.');
    return {
      source: { type: state.csvPreview && state.manualPreview ? 'csv+manual' : state.csvPreview ? 'csv' : 'manual' },
      recipients,
      objective: state.objective.trim(),
      message_variants: messages.map((entry, index) => ({ id: `message-${index + 1}`, text: entry.text, order: index, active: true })),
      image_variants: state.images.map((image, index) => ({ ...image, id: `image-${index + 1}` })),
      caption_policy: state.captionPolicy,
      pacing_policy: pacingPolicy,
    };
  }

  async function createPreview() {
    try { state.preview = await api('/api/whatsapp/dispatch/campaign/preview', { method: 'POST', body: JSON.stringify(payload()) }); state.draft = null; state.error = null; }
    catch (error) { state.error = error instanceof Error ? error.message : String(error); }
    render();
  }

  async function createDraft() {
    try {
      if (!state.preview) throw new Error('Gere o PREVIEW antes de criar o Batch.');
      state.draft = await api('/api/whatsapp/dispatch/campaigns', { method: 'POST', body: JSON.stringify({ preview: state.preview }) });
      state.error = null;
      await loadCampaigns(false);
    } catch (error) { state.error = error instanceof Error ? error.message : String(error); }
    render();
  }

  async function confirmCampaign() {
    try {
      if (!state.draft?.batch?.batchId) throw new Error('Crie o Batch DRAFT antes da confirmação.');
      if (!window.confirm('Confirmar esta campanha? Após a confirmação, objective, recipients, variantes, legenda e pacing ficam congelados para este Batch.')) return;
      state.draft = await api(`/api/whatsapp/dispatch/campaigns/${encodeURIComponent(state.draft.batch.batchId)}`, { method: 'POST', body: JSON.stringify({ action: 'confirm', fingerprint: state.draft.fingerprint, recipient_count: state.draft.batch.preview.recipientCount }) });
      state.error = null;
    } catch (error) { state.error = error instanceof Error ? error.message : String(error); }
    render();
  }

  async function queueCampaign() {
    try {
      if (state.draft?.batch?.state !== 'CONFIRMED') throw new Error('A campanha precisa estar CONFIRMED antes de entrar na fila.');
      if (!window.confirm('Enviar a campanha agora? O Batch iniciará o processamento real pelo Gateway.')) return;
      state.draft = await api(`/api/whatsapp/dispatch/campaigns/${encodeURIComponent(state.draft.batch.batchId)}`, { method: 'POST', body: JSON.stringify({ action: 'queue' }) });
      state.error = null;
      await loadCampaigns(false);
    } catch (error) { state.error = error instanceof Error ? error.message : String(error); }
    render();
  }

  async function cancelCampaign() {
    try {
      if (!state.draft?.batch?.batchId) return;
      if (!window.confirm('Cancelar esta campanha? Nenhum trabalho pendente deverá iniciar após o cancelamento.')) return;
      state.draft = await api(`/api/whatsapp/dispatch/campaigns/${encodeURIComponent(state.draft.batch.batchId)}`, { method: 'POST', body: JSON.stringify({ action: 'cancel' }) });
      state.error = null;
      await loadCampaigns(false);
    } catch (error) { state.error = error instanceof Error ? error.message : String(error); }
    render();
  }

  async function loadCampaigns(shouldRender = true) {
    try { const result = await api('/api/whatsapp/dispatch/campaigns'); state.campaigns = Array.isArray(result.campaigns) ? result.campaigns : []; state.error = null; }
    catch (error) { state.error = error instanceof Error ? error.message : String(error); }
    if (shouldRender) render();
  }

  function interceptNavigation() {
    if (document.__kassistCampaignDispatchUiBound) return;
    document.__kassistCampaignDispatchUiBound = true;
    document.addEventListener('click', event => {
      const button = event.target.closest?.('[data-page="broadcasts"]');
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      render();
      void loadCampaigns();
    }, true);
  }

  interceptNavigation();
})();
