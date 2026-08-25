(() => {
  const GATEWAY = 'http://127.0.0.1:3210';
  const state = {
    settings: { autoUpdateEnabled: false, intervalHours: 24 },
    models: { reachable: false, models: [], error: null },
    credentials: [],
    loading: false,
    updating: false,
    updatingModel: null,
    validating: null,
    error: null,
    message: '',
  };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function formatBytes(value) {
    const size = Number(value);
    if (!Number.isFinite(size) || size < 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let amount = size;
    let index = 0;
    while (amount >= 1024 && index < units.length - 1) { amount /= 1024; index += 1; }
    return `${amount.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  }

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

  function modelStatus(model) {
    if (state.updatingModel === model.name) return 'UPDATING';
    return model.status || 'UNKNOWN';
  }

  function credentialRows() {
    return state.credentials.map(item => {
      const validationState = item.validationStatus || 'UNKNOWN';
      const buttonDisabled = state.validating === item.key;
      const accountIdNote = item.key === 'CLOUDFLARE_ACCOUNT_ID' ? '<div class="muted" style="font-size:11px;margin-top:4px">Identificador da conta; não é tratado como segredo.</div>' : '';
      return `
        <div class="card" style="box-shadow:none;padding:14px">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
            <div>
              <strong>${esc(item.label)}</strong>
              <div class="muted" style="font-size:12px;margin-top:4px">${esc(item.key)}</div>
            </div>
            <span class="badge ${item.configured ? 'confirmed' : 'unknown'}">${item.configured ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}</span>
          </div>
          <div class="field" style="margin-top:12px;margin-bottom:0">
            <label for="credential-${esc(item.key)}">${item.secret ? 'Chave / Token' : 'Valor'}</label>
            <input id="credential-${esc(item.key)}" type="password" autocomplete="off" placeholder="${item.configured ? '••••••••••••  (substituir somente se necessário)' : 'Informe o valor'}" data-credential-key="${esc(item.key)}" />
            ${accountIdNote}
          </div>
          <div style="display:flex;justify-content:space-between;gap:8px;margin-top:10px;align-items:center;flex-wrap:wrap">
            <span class="badge ${validationState === 'VALID' ? 'confirmed' : validationState === 'INVALID' ? 'unavailable' : 'unknown'}">Validação: ${esc(validationState)}</span>
            <div style="display:flex;gap:8px">
              ${item.configured ? `<button class="btn" data-credential-test="${esc(item.key)}" ${buttonDisabled ? 'disabled' : ''}>${buttonDisabled ? 'Testando…' : 'Testar'}</button>` : ''}
              ${item.configured ? `<button class="btn danger" data-credential-delete="${esc(item.key)}">Remover</button>` : ''}
              <button class="btn primary" data-credential-save="${esc(item.key)}">${item.configured ? 'Substituir' : 'Salvar'}</button>
            </div>
          </div>
          ${item.lastValidatedAt ? `<div class="muted" style="font-size:11px;margin-top:6px">Última validação: ${esc(item.lastValidatedAt)}</div>` : ''}
          ${item.error ? `<div class="error" style="margin-top:6px">${esc(item.error)}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function render() {
    if (!isSettingsPage()) return;
    const main = document.querySelector('#main');
    if (!main) return;

    main.innerHTML = `
      <div class="toolbar">
        <div>
          <h2 style="margin:0">Modelos de Linguagem e Chaves de API</h2>
          <p class="muted" style="margin:6px 0 0">Gerencie modelos locais, atualização automática e credenciais dos provedores externos.</p>
        </div>
        <div class="inline-status">
          <span class="badge ${state.models.reachable ? 'confirmed' : 'unavailable'}">Ollama: ${state.models.reachable ? 'DISPONÍVEL' : 'INDISPONÍVEL'}</span>
          <button class="btn" id="llm-settings-refresh" ${state.loading ? 'disabled' : ''}>Atualizar</button>
        </div>
      </div>

      ${state.error ? `<div class="error" style="margin-bottom:16px">${esc(state.error)}</div>` : ''}
      ${state.message ? `<div class="notice" style="margin-bottom:16px">${esc(state.message)}</div>` : ''}

      <section class="card" style="margin-bottom:16px">
        <div class="toolbar" style="margin-bottom:12px">
          <div>
            <h3 style="margin:0">Modelos de Linguagem</h3>
            <p class="muted" style="margin:6px 0 0">Gerencie os modelos realmente instalados no runtime local. Atualmente o runtime suportado é Ollama.</p>
          </div>
          <button class="btn primary" id="llm-settings-update" ${state.updating || !state.models.reachable ? 'disabled' : ''}>${state.updating ? 'Atualizando…' : 'Atualizar todos'}</button>
        </div>
        ${state.models.error ? `<div class="notice">${esc(state.models.error)}</div>` : ''}
        ${state.models.inventory?.models?.length ? `
          <table>
            <thead><tr><th>Modelo</th><th>Runtime</th><th>Status</th><th>Tamanho</th><th>Atualizado</th><th></th></tr></thead>
            <tbody>
              ${state.models.inventory.models.map(model => `
                <tr>
                  <td><div class="mono">${esc(model.name)}</div><div class="muted" style="font-size:11px;margin-top:4px">${esc(model.identifier)}</div></td>
                  <td>${esc(model.runtime)}</td>
                  <td><span class="badge ${modelStatus(model) === 'UPDATED' || modelStatus(model) === 'INSTALLED' ? 'confirmed' : modelStatus(model) === 'FAILED' ? 'unavailable' : 'unknown'}">${esc(modelStatus(model))}</span></td>
                  <td>${formatBytes(model.sizeBytes)}</td>
                  <td>${model.modifiedAt ? esc(new Date(model.modifiedAt).toLocaleString('pt-BR')) : '—'}</td>
                  <td><button class="btn" data-model-update="${esc(model.name)}" ${state.updating || state.updatingModel ? 'disabled' : ''}>Atualizar</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<div class="empty">Nenhum modelo local foi encontrado.</div>'}
        <div class="muted" style="margin-top:12px;font-size:11px">O estado UPDATE_AVAILABLE só será mostrado quando o runtime fornecer evidência confiável de atualização; o inventário atual não infere versões pelo nome.</div>
      </section>

      <section class="card" style="margin-bottom:16px">
        <div class="toolbar" style="margin-bottom:12px">
          <div>
            <h3 style="margin:0">Atualização Automática</h3>
            <p class="muted" style="margin:6px 0 0">O scheduler é executado pelo Gateway e reaplica a política após cada ciclo.</p>
          </div>
          <span class="badge ${state.settings.autoUpdateEnabled ? 'confirmed' : 'unknown'}">${state.settings.autoUpdateEnabled ? 'ATIVA' : 'DESATIVADA'}</span>
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
        <div class="notice">O KassisT não marca um modelo como atualizado apenas pelo nome. O update real é executado por POST /api/pull do Ollama.</div>
        <div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn primary" id="llm-auto-save">Salvar política de atualização</button></div>
      </section>

      <section>
        <div style="margin-bottom:12px">
          <h3 style="margin:0">Chaves de API</h3>
          <p class="muted" style="margin:6px 0 0">Os segredos são armazenados com Windows DPAPI. A interface recebe somente estado sanitizado; nunca recebe o valor salvo.</p>
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
        const result = await api('/api/llm/models/update', { method: 'POST', body: JSON.stringify({}) });
        state.message = result.failed?.length
          ? `Atualização concluída com ${result.updated?.length || 0} sucesso(s) e ${result.failed.length} falha(s).`
          : `Atualização concluída para ${result.updated?.length || 0} modelo(s).`;
        state.models = await api('/api/llm/models');
      } catch (error) {
        state.error = error instanceof Error ? error.message : String(error);
        state.message = '';
      } finally {
        state.updating = false;
        render();
      }
    });

    document.querySelectorAll('[data-model-update]').forEach(button => {
      button.addEventListener('click', async () => {
        const model = button.dataset.modelUpdate;
        state.updatingModel = model;
        state.error = null;
        state.message = `Atualizando ${model}…`;
        render();
        try {
          await api('/api/llm/models/update', { method: 'POST', body: JSON.stringify({ model }) });
          state.message = `${model} atualizado com sucesso.`;
          state.models = await api('/api/llm/models');
        } catch (error) {
          state.error = error instanceof Error ? error.message : String(error);
          state.message = '';
        } finally {
          state.updatingModel = null;
          render();
        }
      });
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

    document.querySelectorAll('[data-credential-test]').forEach(button => {
      button.addEventListener('click', async () => {
        const key = button.dataset.credentialTest;
        state.validating = key;
        state.error = null;
        render();
        try {
          const result = await api('/api/credentials/validate', { method: 'POST', body: JSON.stringify({ key }) });
          state.message = result.validationStatus === 'VALID'
            ? `${key}: credencial válida.`
            : result.validationStatus === 'UNAVAILABLE'
              ? `${key}: validação indisponível para este provider.`
              : `${key}: validação retornou ${result.validationStatus}.`;
          state.credentials = (await api('/api/credentials')).credentials || [];
        } catch (error) {
          state.error = error instanceof Error ? error.message : String(error);
          state.message = '';
        } finally {
          state.validating = null;
          render();
        }
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
  }

  new MutationObserver(mount).observe(document.body, { childList: true, subtree: true, attributes: true });
  window.addEventListener('kassist:settings-page', mount);
  mount();
})();
