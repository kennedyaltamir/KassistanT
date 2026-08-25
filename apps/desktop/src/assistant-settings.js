(() => {
  const NAV_LABEL = 'Atendente';
  const state = { config: null, draft: null, loading: false, saving: false, error: '', message: '' };
  const days = [
    ['monday', 'Segunda'], ['tuesday', 'Terça'], ['wednesday', 'Quarta'],
    ['thursday', 'Quinta'], ['friday', 'Sexta'], ['saturday', 'Sábado'], ['sunday', 'Domingo']
  ];

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function api() {
    return window.kassist?.assistant;
  }

  function isPageActive() {
    return document.querySelector('.nav button[data-page="attendant"]')?.classList.contains('active') === true;
  }

  function ensureNav() {
    const nav = document.querySelector('.nav');
    if (!nav || nav.querySelector('[data-page="attendant"]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.page = 'attendant';
    button.textContent = NAV_LABEL;
    button.addEventListener('click', () => {
      nav.querySelectorAll('button').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      document.querySelector('#page-title').textContent = NAV_LABEL;
      load();
    });
    nav.appendChild(button);
  }

  function normalizeDraft() {
    if (!state.draft) return;
    state.draft.business_hours = state.draft.business_hours || {};
    for (const [key] of days) {
      if (!Array.isArray(state.draft.business_hours[key])) state.draft.business_hours[key] = [];
    }
  }

  async function load() {
    if (!isPageActive()) return;
    state.loading = true; state.error = '';
    render();
    try {
      state.config = await api().get();
      state.draft = clone(state.config);
      normalizeDraft();
      state.message = '';
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error);
    } finally {
      state.loading = false;
      render();
    }
  }

  function currentDraftFromDom() {
    if (!state.draft) return null;
    const next = clone(state.draft);
    const value = id => document.querySelector(`#${id}`)?.value ?? '';
    const checked = id => document.querySelector(`#${id}`)?.checked === true;
    next.company_name = value('assistant-company-name').trim();
    next.company_address = value('assistant-company-address').trim();
    next.timezone = value('assistant-timezone');
    next.assistant_name = value('assistant-name').trim();
    next.language = value('assistant-language');
    next.conversation_mode = value('assistant-mode');
    next.behavior_instructions = value('assistant-behavior').trim();
    next.enabled = checked('assistant-enabled');
    next.history_policy = { enabled: checked('assistant-history-enabled'), max_messages: Number(value('assistant-history-limit') || 30) };
    next.after_hours_policy = { enabled: checked('assistant-after-hours-enabled'), message: value('assistant-after-hours-message').trim() };
    for (const [key] of days) {
      const rows = [...document.querySelectorAll(`[data-hours-day="${key}"] .assistant-hours-row`)];
      next.business_hours[key] = rows.map(row => ({
        open: row.querySelector('.assistant-hours-open')?.value || '',
        close: row.querySelector('.assistant-hours-close')?.value || ''
      }));
    }
    next.customer_context_policy = {};
    for (const key of ['name','phone','whatsapp_id','preferences','conversation_history','order_history','relationship','address','email']) {
      next.customer_context_policy[key] = checked(`assistant-context-${key}`);
    }
    next.sale_notification_policy = {
      ...next.sale_notification_policy,
      enabled: checked('assistant-sale-notification-enabled'),
      channel: value('assistant-sale-notification-channel')
    };
    return next;
  }

  function addInterval(day) {
    const form = document.querySelector(`[data-hours-day="${day}"]`);
    if (!form) return;
    const row = document.createElement('div');
    row.className = 'assistant-hours-row';
    row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-top:8px';
    row.innerHTML = '<input class="assistant-hours-open" type="time" value="08:00" aria-label="Abertura"/><input class="assistant-hours-close" type="time" value="18:00" aria-label="Fechamento"/><button type="button" class="btn assistant-hours-remove">Remover</button>';
    row.querySelector('.assistant-hours-remove').addEventListener('click', () => row.remove());
    form.appendChild(row);
  }

  function renderHours() {
    return days.map(([key, label]) => {
      const intervals = state.draft?.business_hours?.[key] || [];
      const rows = intervals.map(item => `<div class="assistant-hours-row" style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-top:8px">
        <input class="assistant-hours-open" type="time" value="${esc(item.open)}" aria-label="Abertura ${label}"/>
        <input class="assistant-hours-close" type="time" value="${esc(item.close)}" aria-label="Fechamento ${label}"/>
        <button type="button" class="btn assistant-hours-remove">Remover</button>
      </div>`).join('');
      return `<div class="card" style="box-shadow:none;padding:14px" data-hours-day="${key}">
        <strong>${label}</strong>
        ${rows || '<div class="muted" style="font-size:12px;margin-top:8px">Fechado</div>'}
        <button type="button" class="btn" style="margin-top:10px" data-hours-add="${key}">Adicionar intervalo</button>
      </div>`;
    }).join('');
  }

  function render() {
    ensureNav();
    if (!isPageActive()) return;
    const main = document.querySelector('#main');
    if (!main) return;
    if (state.loading && !state.draft) {
      main.innerHTML = '<div class="card"><strong>Atendente</strong><p class="muted">Carregando configuração persistida…</p></div>';
      return;
    }
    if (!state.draft) return;
    const d = state.draft;
    const policy = d.customer_context_policy || {};
    const checked = key => policy[key] ? 'checked' : '';
    main.innerHTML = `
      <div class="toolbar">
        <div><h2 style="margin:0">Atendente</h2><p class="muted" style="margin:6px 0 0">Configure a identidade, horário e políticas de contexto do assistente.</p></div>
        <div class="inline-status"><span class="badge ${d.enabled ? 'confirmed' : 'unavailable'}">${d.enabled ? 'ATENDIMENTO HABILITADO' : 'DESABILITADO'}</span></div>
      </div>
      ${state.error ? `<div class="error" style="margin-bottom:16px">${esc(state.error)}</div>` : ''}
      ${state.message ? `<div class="notice" style="margin-bottom:16px">${esc(state.message)}</div>` : ''}
      <section class="card" style="margin-bottom:16px">
        <div class="toolbar" style="margin-bottom:12px"><div><h3 style="margin:0">Empresa</h3><p class="muted" style="margin:6px 0 0">Dados determinísticos do estabelecimento.</p></div></div>
        <div class="grid two">
          <div class="field"><label for="assistant-company-name">Nome da empresa</label><input id="assistant-company-name" maxlength="160" value="${esc(d.company_name)}" placeholder="Ex.: Kassis Burger"/></div>
          <div class="field"><label for="assistant-company-address">Endereço</label><input id="assistant-company-address" maxlength="300" value="${esc(d.company_address)}" placeholder="Opcional"/></div>
          <div class="field"><label for="assistant-timezone">Timezone</label><input id="assistant-timezone" value="${esc(d.timezone)}" placeholder="America/Sao_Paulo"/></div>
          <div class="field"><label for="assistant-enabled">Atendimento</label><label style="display:flex;gap:8px;align-items:center"><input id="assistant-enabled" type="checkbox" ${d.enabled ? 'checked' : ''}/> Assistente habilitado para atendimento</label></div>
        </div>
      </section>
      <section class="card" style="margin-bottom:16px">
        <h3 style="margin-top:0">Identidade do Assistente</h3>
        <div class="grid two">
          <div class="field"><label for="assistant-name">Nome do assistente</label><input id="assistant-name" maxlength="80" value="${esc(d.assistant_name)}"/></div>
          <div class="field"><label for="assistant-language">Idioma</label><select id="assistant-language"><option value="pt-BR" ${d.language === 'pt-BR' ? 'selected' : ''}>Português — Brasil</option><option value="en-US" ${d.language === 'en-US' ? 'selected' : ''}>English — US</option><option value="es-ES" ${d.language === 'es-ES' ? 'selected' : ''}>Español — España</option></select></div>
          <div class="field"><label for="assistant-mode">Forma de atendimento</label><select id="assistant-mode"><option value="PROFESSIONAL" ${d.conversation_mode === 'PROFESSIONAL' ? 'selected' : ''}>Profissional</option><option value="CORDIAL" ${d.conversation_mode === 'CORDIAL' ? 'selected' : ''}>Cordial</option><option value="INFORMAL" ${d.conversation_mode === 'INFORMAL' ? 'selected' : ''}>Informal</option><option value="CUSTOM" ${d.conversation_mode === 'CUSTOM' ? 'selected' : ''}>Personalizado</option></select></div>
          <div class="field"><label for="assistant-behavior">Instruções linguísticas</label><textarea id="assistant-behavior" maxlength="2000" rows="4" placeholder="Ex.: seja objetivo, cordial e confirme o pedido antes de finalizar.">${esc(d.behavior_instructions)}</textarea></div>
        </div>
      </section>
      <section class="card" style="margin-bottom:16px">
        <h3 style="margin-top:0">Horário de Funcionamento</h3>
        <p class="muted">O horário é usado pelo Core para determinar se o estabelecimento está aberto; a LLM não decide essa condição.</p>
        <div class="grid two">${renderHours()}</div>
        <div class="grid two" style="margin-top:16px">
          <div class="field"><label for="assistant-after-hours-enabled">Fora do horário</label><label style="display:flex;gap:8px;align-items:center"><input id="assistant-after-hours-enabled" type="checkbox" ${d.after_hours_policy?.enabled !== false ? 'checked' : ''}/> Responder com política fora do horário</label></div>
          <div class="field"><label for="assistant-after-hours-message">Mensagem</label><input id="assistant-after-hours-message" maxlength="500" value="${esc(d.after_hours_policy?.message || '')}"/></div>
        </div>
      </section>
      <section class="card" style="margin-bottom:16px">
        <h3 style="margin-top:0">Dados disponibilizados ao atendimento</h3>
        <p class="muted">Estes controles definem política de contexto. A LLM não consulta o banco diretamente.</p>
        <div class="grid three">
          ${[['name','Nome'],['phone','Telefone'],['whatsapp_id','Identificador WhatsApp'],['preferences','Preferências'],['conversation_history','Histórico de conversas'],['order_history','Histórico de pedidos'],['relationship','Relacionamento'],['address','Endereço'],['email','E-mail']].map(([key,label]) => `<label style="display:flex;gap:8px;align-items:center"><input id="assistant-context-${key}" type="checkbox" ${checked(key)}/> ${label}</label>`).join('')}
        </div>
        <div class="grid two" style="margin-top:16px">
          <div class="field"><label for="assistant-history-enabled">Histórico</label><label style="display:flex;gap:8px;align-items:center"><input id="assistant-history-enabled" type="checkbox" ${d.history_policy?.enabled !== false ? 'checked' : ''}/> Permitir histórico no contexto</label></div>
          <div class="field"><label for="assistant-history-limit">Máximo de mensagens por contexto</label><input id="assistant-history-limit" type="number" min="1" max="200" value="${Number(d.history_policy?.max_messages || 30)}"/></div>
        </div>
      </section>
      <section class="card" style="margin-bottom:16px">
        <h3 style="margin-top:0">Notificação de venda</h3>
        <p class="muted">A notificação somente deverá ser disparada por evento comercial confirmado pelo Core.</p>
        <div class="grid two">
          <label style="display:flex;gap:8px;align-items:center"><input id="assistant-sale-notification-enabled" type="checkbox" ${d.sale_notification_policy?.enabled ? 'checked' : ''}/> Notificar administrador após venda consumada</label>
          <div class="field"><label for="assistant-sale-notification-channel">Canal</label><select id="assistant-sale-notification-channel"><option value="WHATSAPP" selected>WhatsApp</option></select></div>
        </div>
      </section>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:20px"><button class="btn" id="assistant-reset">Restaurar</button><button class="btn" id="assistant-validate">Validar</button><button class="btn primary" id="assistant-save" ${state.saving ? 'disabled' : ''}>${state.saving ? 'Salvando…' : 'Salvar configuração'}</button></div>
    `;

    document.querySelectorAll('[data-hours-add]').forEach(button => button.addEventListener('click', () => addInterval(button.dataset.hoursAdd)));
    document.querySelectorAll('.assistant-hours-remove').forEach(button => button.addEventListener('click', () => button.closest('.assistant-hours-row')?.remove()));
    document.querySelector('#assistant-reset')?.addEventListener('click', () => { state.draft = clone(state.config); normalizeDraft(); state.message = 'Alterações locais descartadas.'; state.error = ''; render(); });
    document.querySelector('#assistant-validate')?.addEventListener('click', async () => {
      state.error = ''; state.message = ''; render();
      try {
        const result = await api().validate(currentDraftFromDom());
        state.message = result.valid ? 'Configuração válida e pronta para persistência.' : `Configuração inválida: ${result.errors.join(', ')}`;
      } catch (error) { state.error = error instanceof Error ? error.message : String(error); }
      render();
    });
    document.querySelector('#assistant-save')?.addEventListener('click', async () => {
      state.saving = true; state.error = ''; state.message = ''; render();
      try {
        state.config = await api().save(currentDraftFromDom());
        state.draft = clone(state.config); normalizeDraft();
        state.message = 'Configuração salva e confirmada pelo backend.';
      } catch (error) { state.error = error instanceof Error ? error.message : String(error); }
      finally { state.saving = false; render(); }
    });
  }

  function watchNavigation() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    ensureNav();
    const observer = new MutationObserver(() => {
      if (isPageActive()) {
        if (!state.config && !state.loading) load();
      }
    });
    observer.observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  function mount() {
    ensureNav();
    watchNavigation();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
