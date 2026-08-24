(() => {
  const GATEWAY = 'http://127.0.0.1:3210';
  const state = {
    settings: { autoUpdateEnabled: false, intervalHours: 24 },
    models: { reachable: false, models: [], error: null },
    credentials: [],
    loading: false,
    updating: false,
    error: null,
    message: '',
  };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  async function api(path, options = {}) {
    const response = await fetch(GATEWAY + path, {
      ...options,
      headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Falha HTTP ${response.status}`);
    return body;
  }

  function isSettingsPage() {
    return document.querySelector('.nav button.active')?.dataset?.page === 'settings';
  }

  async function load() {
    state.loading = true;
    state.error = null;
    try {
      const [settings, models, credentials] = await Promise.all([
        api('/api/llm/settings'),
        api('/api/llm/models'),
        api('/api/credentials'),
      ]);
      state.settings = settings;
      state.models = models;
      state.credentials = credentials.credentials || [];
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error);
    } finally {
      state.loading = false;
    }
    render();
  }

  function credentialRows() {
    return state.credentials.map(item => `
      <div class="card" style="box-shadow:none;padding:14px">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
          <div>
            <strong>${esc(item.label)}</strong>
            <div class="muted" style="font-size:12px;margin-top:4px">${esc(item.key)}</div>
          </div>
          <span class="badge ${item.configured ? 'confirmed' : 'unknown'}">
            ${item.configured ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}
          </span>
        </div>
        <div class="field" style="margin-top:12px;margin-bottom:0">
          <label for="credential-${esc(item.key)}">${item.secret ? 'Chave / Token' : 'Valor'}</label>
          <input
            id="credential-${esc(item.key)}"
            type="password"
            autocomplete="off"
            placeholder="${item.configured ? '••••••••••••  (substituir somente se necessário)' : 'Informe o valor'}"
            data-credential-key="${esc(item.key)}"
          />
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px">
          ${item.configured ? `<button class="btn danger" data-credential-delete="${esc(item.key)}">Remover</button>` : ''}
          <button class="btn primary" data-credential-save="${esc(item.key)}">Salvar</button>
        </div>
      </div>
    `).join('');
  }

  function render() {
    if (!isSettingsPage()) return;
    const main = document.querySelector('#main');
    if (!main) return;

    main.innerHTML = `
      <div class="toolbar">
        <div>
          <h2 style="margin:0">Modelos de Linguagem e Chaves de API</h2>
          <p class="muted" style="margin:6px 0 0">Gerenciamento operacional de modelos locais e credenciais de provedores.</p>
        </div>
        <div class="inline-status">
          <span class="badge ${state.models.reachable ? 'confirmed' : 'unavailable'}">
            Ollama: ${state.models.reachable ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
          </span>
          <button class="btn" id="llm-settings-refresh" ${state.loading ? 'disabled' : ''}>Atualizar</button>
        </div>
      </div>

      ${state.error ? `<div class="error" style="margin-bottom:16px">${esc(state.error)}</div>` : ''}
      ${state.message ? `<div class="notice" style="margin-bottom:16px">${esc(state.message)}</div>` : ''}

      <section class="card" style="margin-bottom:16px">
        <div class="toolbar" style="margin-bottom:12px">
          <div>
            <h3 style="margin:0">Modelos de linguagem instalados</h3>
            <p class="muted" style="margin:6px 0 0">O runtime local atualmente suportado pelo KassisT é o Ollama.</p>
          </div>
          <button class="btn primary" id="llm-settings-update" ${state.updating || !state.models.reachable ? 'disabled' : ''}>
            ${state.updating ? 'Atualizando…' : 'Atualizar todos'}
          </button>
        </div>

        ${state.models.error ? `<div class="notice">${esc(state.models.error)}</div>` : ''}
        ${state.models.models?.length ? `
          <table>
            <thead><tr><th>Modelo</th><th>Runtime</th><th>Status</th></tr></thead>
            <tbody>
              ${state.models.models.map(model => `
                <tr>
                  <td class="mono">${esc(model)}</td>
                  <td>Ollama</td>
                  <td><span class="badge confirmed">INSTALADO</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<div class="empty">Nenhum modelo local foi encontrado.</div>'}
      </section>

      <section class="card" style="margin-bottom:16px">
        <div class="toolbar" style="margin-bottom:12px">
          <div>
            <h3 style="margin:0">Atualização automática</h3>
            <p class="muted" style="margin:6px 0 0">A atualização é executada pelo Gateway, nunca pelo renderer.</p>
          </div>
          <span class="badge ${state.settings.autoUpdateEnabled ? 'confirmed' : 'unknown'}">
            ${state.settings.autoUpdateEnabled ? 'ATIVA' : 'DESATIVADA'}
          </span>
        </div>
        <div class="grid two">
          <div class="field">
            <label for="llm-auto-update">Atualizar automaticamente</label>
            <select id="llm-auto-update">
              <option value="false" ${state.settings.autoUpdateEnabled ? '' : 'selected'}>Desativado</option>
              <option value="true" ${state.settings.autoUpdateEnabled ? 'selected' : ''}>Ativado</option>
            </select>
          </div>
          <div class="field">
            <label for="llm-interval">Intervalo (horas)</label>
            <input id="llm-interval" type="number" min="1" max="168" value="${Number(state.settings.intervalHours || 24)}" />
          </div>
        </div>
        <div class="notice">Atualizar modelos pode baixar grandes quantidades de dados. O KassisT mantém a opção desativada por padrão para evitar downloads inesperados.</div>
        <div class="ai-actions" style="display:flex;justify-content:flex-end;margin-top:12px">
          <button class="btn primary" id="llm-auto-save">Salvar política de atualização</button>
        </div>
      </section>

      <section>
        <div style="margin-bottom:12px">
          <h3 style="margin:0">Chaves de API e credenciais</h3>
          <p class="muted" style="margin:6px 0 0">Os valores são armazenados usando Windows DPAPI e nunca são retornados para a interface.</p>
        </div>
        <div class="grid two">${credentialRows()}</div>
      </section>
    `;

    document.querySelector('#llm-settings-refresh')?.addEventListener('click', load);

    document.querySelector('#llm-settings-update')?.addEventListener('click', async () => {
      state.updating = true;
      state.error = null;
      state.message = 'Atualizando os modelos instalados…';
      render();
      try {
        const result = await api('/api/llm/models/update', { method: 'POST', body: '{}' });
        state.message = result.updated?.length
          ? `Atualização concluída para ${result.updated.length} modelo(s).`
          : 'Atualização concluída; nenhum modelo reportou alteração.';
        state.models = await api('/api/llm/models');
      } catch (error) {
        state.error = error instanceof Error ? error.message : String(error);
        state.message = '';
      } finally {
        state.updating = false;
        render();
      }
    });

    document.querySelector('#llm-auto-save')?.addEventListener('click', async () => {
      try {
        state.settings = await api('/api/llm/settings', {
          method: 'PUT',
          body: JSON.stringify({
            autoUpdateEnabled: document.querySelector('#llm-auto-update')?.value === 'true',
            intervalHours: Number(document.querySelector('#llm-interval')?.value || 24),
          }),
        });
        state.message = 'Política de atualização salva.';
        state.error = null;
      } catch (error) {
        state.error = error instanceof Error ? error.message : String(error);
      }
      render();
    });

    document.querySelectorAll('[data-credential-save]').forEach(button => {
      button.addEventListener('click', async () => {
        const key = button.dataset.credentialSave;
        const input = document.querySelector(`[data-credential-key="${CSS.escape(key)}"]`);
        const value = input?.value?.trim() || '';
        if (!value) {
          state.error = 'Informe o valor antes de salvar.';
          render();
          return;
        }
        try {
          await api('/api/credentials', { method: 'PUT', body: JSON.stringify({ key, value }) });
          state.credentials = (await api('/api/credentials')).credentials || [];
          state.message = `${key} configurada com sucesso.`;
          state.error = null;
        } catch (error) {
          state.error = error instanceof Error ? error.message : String(error);
          state.message = '';
        }
        render();
      });
    });

    document.querySelectorAll('[data-credential-delete]').forEach(button => {
      button.addEventListener('click', async () => {
        const key = button.dataset.credentialDelete;
        if (!window.confirm(`Remover a credencial ${key}?`)) return;
        try {
          await api(`/api/credentials?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
          state.credentials = (await api('/api/credentials')).credentials || [];
          state.message = `${key} removida.`;
          state.error = null;
        } catch (error) {
          state.error = error instanceof Error ? error.message : String(error);
          state.message = '';
        }
        render();
      });
    });
  }

  let rendering = false;
  function mount() {
    if (!isSettingsPage() || rendering) return;
    rendering = true;
    try { render(); } finally { rendering = false; }
    if (!state.credentials.length && !state.loading) load();
  }

  function start() {
    if (window.__kassistLlmSettingsStarted) return;
    window.__kassistLlmSettingsStarted = true;
    const main = document.querySelector('#main');
    if (!main) return;

    new MutationObserver(() => {
      if (!rendering && isSettingsPage() && main.innerHTML.includes('Nenhuma configuração persistente')) mount();
    }).observe(main, { childList: true, subtree: false });

    document.querySelectorAll('.nav button').forEach(button => {
      button.addEventListener('click', () => setTimeout(mount, 0));
    });

    setTimeout(mount, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
