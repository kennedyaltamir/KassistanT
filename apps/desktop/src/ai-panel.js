(() => {
  const GATEWAY = 'http://127.0.0.1:3210';
  const PANEL_ID = 'kassist-ai-panel';
  const BUTTON_ID = 'kassist-ai-button';

  const state = { config: null, provider: null, saving: false, testing: false, testMessage: '', error: null, jid: null, policy: {} };

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  async function api(path, options = {}) {
    const response = await fetch(GATEWAY + path, {
      ...options,
      headers: { 'content-type': 'application/json', ...(options.headers || {}) }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || ('Falha HTTP ' + response.status));
    return body;
  }

  function currentJid() {
    return document.querySelector('.conversation-row.active')?.dataset?.jid || null;
  }

  function toast(message) {
    const root = $('#toast-root');
    if (!root) return;
    root.innerHTML = '<div class="toast" role="status">' + esc(message) + '</div>';
    setTimeout(() => { if (root.innerHTML) root.innerHTML = ''; }, 3200);
  }

  function ensureStyles() {
    if ($('#kassist-ai-panel-style')) return;
    const style = document.createElement('style');
    style.id = 'kassist-ai-panel-style';
    style.textContent = `
      #${PANEL_ID}{position:fixed;top:76px;right:20px;width:min(460px,calc(100vw - 40px));max-height:calc(100vh - 96px);overflow:auto;background:#fff;border:1px solid #e4e7ef;border-radius:14px;box-shadow:0 16px 50px rgba(23,32,51,.18);z-index:100;padding:20px;display:none}
      #${PANEL_ID}.open{display:block}
      #${PANEL_ID} .ai-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:16px}
      #${PANEL_ID} .ai-title{font-size:18px;font-weight:800}
      #${PANEL_ID} .ai-sub,#${PANEL_ID} .ai-note{color:#687086;font-size:12px;line-height:1.45}
      #${PANEL_ID} .ai-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      #${PANEL_ID} .ai-field{display:grid;gap:6px;margin-bottom:12px}
      #${PANEL_ID} .ai-full{grid-column:1/-1}
      #${PANEL_ID} label{font-weight:700;font-size:12px}
      #${PANEL_ID} input,#${PANEL_ID} textarea,#${PANEL_ID} select{width:100%;border:1px solid #cfd5e2;border-radius:8px;padding:9px;background:#fff}
      #${PANEL_ID} input[readonly]{background:#f7f8fb;color:#687086}
      #${PANEL_ID} textarea{min-height:140px;resize:vertical}
      #${PANEL_ID} .ai-row{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px}
      #${PANEL_ID} .ai-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}
      #${PANEL_ID} .ai-state{font-size:11px;padding:4px 8px;border-radius:999px;background:#eef0f6;color:#515b73}
      #${PANEL_ID} .ai-state.ok{background:#e4f6ee;color:#116846}
      #${PANEL_ID} .ai-state.bad{background:#f4e9eb;color:#943542}
      #${PANEL_ID} .ai-section{border-top:1px solid #e4e7ef;margin-top:16px;padding-top:16px}
      #${PANEL_ID} .ai-error{padding:10px;border-radius:8px;background:#f4e9eb;color:#943542;font-size:12px;margin-bottom:12px}
      #${PANEL_ID} .ai-feedback{padding:10px;border-radius:8px;background:#e4f6ee;color:#116846;font-size:12px;margin-bottom:12px}
      #${BUTTON_ID}{margin-left:12px;white-space:nowrap}
      @media(max-width:720px){#${PANEL_ID}{top:64px;right:10px;width:calc(100vw - 20px);max-height:calc(100vh - 74px)}#${PANEL_ID} .ai-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function render() {
    const panel = $('#' + PANEL_ID);
    if (!panel) return;
    const config = state.config || {};
    const enabled = Boolean(config.enabled);
    const providerOk = state.provider?.reachable === true;
    const modelOk = state.provider?.selectedModelAvailable === true;
    const providerLabel = !state.provider ? 'NÃO TESTADO' : providerOk && modelOk ? 'OLLAMA OK' : providerOk ? 'MODELO NÃO ENCONTRADO' : 'OLLAMA INDISPONÍVEL';
    const mode = !state.jid ? 'SELECIONE UMA CONVERSA' : state.policy.enabled === false ? 'DESATIVADA NESTA CONVERSA' : state.policy.enabled === true ? 'ATIVADA NESTA CONVERSA' : 'HERDA GLOBAL';
    const testState = state.testing ? 'TESTANDO…' : state.testMessage || (!state.provider ? 'AINDA NÃO TESTADO' : providerLabel);
    const testStateClass = state.testing ? '' : providerOk && modelOk ? 'ok' : state.testMessage && !providerOk ? 'bad' : '';

    panel.innerHTML = `
      <div class="ai-head"><div><div class="ai-title">IA Local</div><div class="ai-sub">Auto-reply operacional • Ollama local • Gateway</div></div><button class="btn" id="ai-close">Fechar</button></div>
      ${state.error ? '<div class="ai-error">' + esc(state.error) + '</div>' : ''}
      ${state.testMessage ? '<div class="ai-feedback">' + esc(state.testMessage) + '</div>' : ''}
      <div class="ai-row"><div><strong>Estado global</strong><div class="ai-note">Controla o auto-reply para novas mensagens.</div></div><span class="ai-state ${enabled ? 'ok' : ''}">${enabled ? 'ATIVA' : 'DESATIVADA'}</span></div>
      <div class="ai-row"><div><strong>Provedor local</strong><div class="ai-note">Teste direto do Ollama configurado.</div></div><span class="ai-state ${providerOk && modelOk ? 'ok' : providerOk ? '' : 'bad'}">${providerLabel}</span></div>
      <div class="ai-row"><div><strong>Último teste</strong><div class="ai-note">Validação operacional do endpoint e do modelo selecionado.</div></div><span class="ai-state ${testStateClass}">${esc(testState)}</span></div>
      <div class="ai-grid">
        <div class="ai-field"><label for="ai-enabled">Auto-reply</label><select id="ai-enabled"><option value="false" ${enabled ? '' : 'selected'}>Desativado</option><option value="true" ${enabled ? 'selected' : ''}>Ativado</option></select></div>
        <div class="ai-field"><label for="ai-model">Modelo Ollama</label><input id="ai-model" value="${esc(config.model || '')}" /></div>
        <div class="ai-field ai-full"><label for="ai-url">Endpoint local</label><input id="ai-url" value="${esc(config.baseUrl || '')}" readonly /><div class="ai-note">Bloqueado para loopback em localhost:11434.</div></div>
        <div class="ai-field"><label for="ai-timeout">Timeout (ms)</label><input id="ai-timeout" type="number" min="1000" max="300000" value="${Number(config.timeoutMs || 60000)}" /></div>
        <div class="ai-field"><label for="ai-context">Mensagens de contexto</label><input id="ai-context" type="number" min="1" max="50" value="${Number(config.contextMessages || 12)}" /></div>
        <div class="ai-field ai-full"><label for="ai-cooldown">Cooldown por conversa (ms)</label><input id="ai-cooldown" type="number" min="0" max="60000" value="${Number(config.cooldownMs || 1500)}" /></div>
        <div class="ai-field ai-full"><label for="ai-prompt">Prompt global</label><textarea id="ai-prompt">${esc(config.systemPrompt || '')}</textarea></div>
      </div>
      <div class="ai-actions"><button class="btn" id="ai-test" ${state.testing ? 'disabled' : ''}>${state.testing ? 'Testando…' : 'Testar Ollama'}</button><button class="btn" id="ai-reload">Recarregar</button><button class="btn primary" id="ai-save" ${state.saving ? 'disabled' : ''}>${state.saving ? 'Salvando…' : 'Salvar configuração'}</button></div>
      ${state.provider?.models?.length ? '<div class="ai-note">Modelos disponíveis: ' + esc(state.provider.models.join(', ')) + '</div>' : ''}
      <div class="ai-section">
        <div class="ai-row"><div><strong>Comportamento por conversa</strong><div class="ai-note">Sem override, a conversa herda o estado global.</div></div><span class="ai-state ${state.jid ? 'ok' : ''}">${mode}</span></div>
        <div class="ai-field"><label for="ai-jid">JID selecionado</label><input id="ai-jid" value="${esc(state.jid || '')}" placeholder="Selecione uma conversa em WhatsApp" readonly /></div>
        <div class="ai-grid">
          <div class="ai-field"><label for="ai-policy-mode">Modo</label><select id="ai-policy-mode" ${state.jid ? '' : 'disabled'}><option value="inherit" ${state.policy.enabled === undefined ? 'selected' : ''}>Herdar global</option><option value="enabled" ${state.policy.enabled === true ? 'selected' : ''}>Sempre ativo</option><option value="disabled" ${state.policy.enabled === false ? 'selected' : ''}>Desativado</option></select></div>
          <div class="ai-field"><label for="ai-policy-status">Status</label><input id="ai-policy-status" value="${esc(mode)}" readonly /></div>
          <div class="ai-field ai-full"><label for="ai-policy-prompt">Prompt desta conversa</label><textarea id="ai-policy-prompt" ${state.jid ? '' : 'disabled'} placeholder="Opcional">${esc(state.policy.prompt || '')}</textarea></div>
        </div>
        <div class="ai-actions"><button class="btn primary" id="ai-save-policy" ${state.jid ? '' : 'disabled'}>Salvar comportamento</button></div>
      </div>
    `;

    $('#ai-close')?.addEventListener('click', () => panel.classList.remove('open'));
    $('#ai-reload')?.addEventListener('click', loadAll);
    $('#ai-test')?.addEventListener('click', testProvider);
    $('#ai-save')?.addEventListener('click', saveConfig);
    $('#ai-save-policy')?.addEventListener('click', savePolicy);
  }

  async function loadAll() {
    state.error = null;
    state.testMessage = '';
    try {
      state.config = await api('/api/whatsapp/ai/config');
      state.jid = currentJid();
      state.policy = state.jid ? await api('/api/whatsapp/ai/conversations?jid=' + encodeURIComponent(state.jid)) : {};
      state.provider = await api('/api/whatsapp/ai/provider');
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error);
    }
    render();
  }

  async function testProvider() {
    state.error = null;
    state.testing = true;
    state.testMessage = 'Executando teste do Ollama…';
    render();
    try {
      state.provider = await api('/api/whatsapp/ai/provider');
      if (state.provider.reachable && state.provider.selectedModelAvailable) {
        state.testMessage = `Teste concluído com sucesso. Ollama acessível e modelo ${state.provider.models?.find(model => model === state.config?.model) || state.config?.model || 'selecionado'} disponível.`;
        toast('Ollama e modelo disponíveis.');
      } else if (state.provider.reachable) {
        state.testMessage = 'Ollama respondeu, mas o modelo selecionado não está disponível.';
        toast('Ollama respondeu; verifique o modelo.');
      } else {
        state.testMessage = state.provider.error || 'Ollama indisponível.';
        toast('Ollama indisponível.');
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error);
      state.testMessage = 'Falha ao testar o provedor local.';
    } finally {
      state.testing = false;
      render();
    }
  }

  async function saveConfig() {
    state.saving = true;
    state.error = null;
    state.testMessage = '';
    render();
    try {
      state.config = await api('/api/whatsapp/ai/config', {
        method: 'PUT',
        body: JSON.stringify({
          enabled: $('#ai-enabled')?.value === 'true',
          model: $('#ai-model')?.value?.trim(),
          timeoutMs: Number($('#ai-timeout')?.value || 60000),
          contextMessages: Number($('#ai-context')?.value || 12),
          cooldownMs: Number($('#ai-cooldown')?.value || 1500),
          systemPrompt: $('#ai-prompt')?.value || ''
        })
      });
      state.provider = await api('/api/whatsapp/ai/provider');
      toast(state.config.enabled ? 'Auto-reply global ativado.' : 'Auto-reply global desativado.');
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error);
    } finally {
      state.saving = false;
      render();
    }
  }

  async function savePolicy() {
    if (!state.jid) return;
    state.error = null;
    try {
      const mode = $('#ai-policy-mode')?.value || 'inherit';
      state.policy = await api('/api/whatsapp/ai/conversations', {
        method: 'PUT',
        body: JSON.stringify({
          jid: state.jid,
          enabled: mode === 'inherit' ? null : mode === 'enabled',
          prompt: $('#ai-policy-prompt')?.value || ''
        })
      });
      toast('Comportamento da conversa salvo.');
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error);
    }
    render();
  }

  function ensureButton() {
    if ($('#' + BUTTON_ID)) return;
    const header = $('.header');
    if (!header) return;
    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.className = 'btn';
    button.textContent = 'IA Local';
    button.title = 'Configurar o auto-reply local';
    button.addEventListener('click', async () => {
      const panel = $('#' + PANEL_ID);
      panel?.classList.toggle('open');
      if (panel?.classList.contains('open')) await loadAll();
    });
    header.querySelector('.status')?.prepend(button);
  }

  function ensurePanel() {
    if ($('#' + PANEL_ID)) return;
    const panel = document.createElement('aside');
    panel.id = PANEL_ID;
    document.body.appendChild(panel);
  }

  function watchSelection() {
    const observer = new MutationObserver(async mutations => {
      if (!$('#' + PANEL_ID)?.classList.contains('open')) return;
      if (!mutations.some(m => m.type === 'attributes')) return;
      const jid = currentJid();
      if (jid === state.jid) return;
      state.jid = jid;
      state.policy = jid ? await api('/api/whatsapp/ai/conversations?jid=' + encodeURIComponent(jid)).catch(() => ({})) : {};
      render();
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  function start() {
    if (window.__kassistAiPanelStarted) return;
    window.__kassistAiPanelStarted = true;
    ensureStyles();
    ensurePanel();
    ensureButton();
    render();
    watchSelection();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
