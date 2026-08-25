(() => {
  const GATEWAY = 'http://127.0.0.1:3210';
  let loaded = false;

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

  function activeSettingsPage() {
    return document.querySelector('.nav button.active')?.dataset?.page === 'settings';
  }

  async function mount() {
    if (loaded || !activeSettingsPage()) return;
    const main = document.querySelector('#main');
    if (!main || main.querySelector('#llm-provider-selection')) return;
    loaded = true;

    try {
      const [catalog, config] = await Promise.all([
        api('/api/llm/providers'),
        api('/api/whatsapp/ai/config'),
      ]);
      const selectable = catalog.providers.filter(item => item.runtimeCapability === 'CHAT' && item.availability === 'AVAILABLE');
      if (!selectable.length) return;

      const section = document.createElement('section');
      section.id = 'llm-provider-selection';
      section.className = 'card';
      section.style.marginBottom = '16px';
      section.innerHTML = `
        <div class="toolbar" style="margin-bottom:12px">
          <div>
            <h3 style="margin:0">Provider do Atendente</h3>
            <p class="muted" style="margin:6px 0 0">Somente runtimes com adapter de chat real podem ser selecionados.</p>
          </div>
          <span id="llm-provider-status" class="badge ${config.provider ? 'confirmed' : 'unknown'}">${esc(config.provider || 'NENHUM')}</span>
        </div>
        <div class="grid two">
          <div class="field">
            <label for="llm-provider-select">Provider</label>
            <select id="llm-provider-select">
              ${selectable.map(item => `<option value="${esc(item.provider)}" ${item.provider === config.provider ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="llm-provider-model">Modelo</label>
            <input id="llm-provider-model" value="${esc(config.model || '')}" maxlength="200" />
          </div>
        </div>
        <div id="llm-provider-message" class="muted" style="margin-top:10px;font-size:12px"></div>
        <div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn primary" id="llm-provider-save">Salvar provider/modelo</button></div>
      `;

      const firstCard = main.querySelector('.card');
      if (firstCard) firstCard.insertAdjacentElement('beforebegin', section);
      else main.prepend(section);

      const select = section.querySelector('#llm-provider-select');
      const model = section.querySelector('#llm-provider-model');
      const save = section.querySelector('#llm-provider-save');
      const status = section.querySelector('#llm-provider-status');
      const message = section.querySelector('#llm-provider-message');

      select.addEventListener('change', () => {
        const selected = selectable.find(item => item.provider === select.value);
        if (selected?.provider === 'groq' && !String(model.value).trim()) model.value = 'openai/gpt-oss-20b';
        message.textContent = selected?.runtimeCapability === 'CHAT' ? 'Runtime de chat disponível.' : 'Este provider não possui runtime de chat.';
      });

      save.addEventListener('click', async () => {
        save.disabled = true;
        message.textContent = 'Salvando…';
        try {
          const result = await api('/api/whatsapp/ai/config', {
            method: 'PUT',
            body: JSON.stringify({
              provider: select.value,
              model: String(model.value || '').trim(),
            }),
          });
          status.textContent = result.provider;
          message.textContent = `Provider ${result.provider} e modelo ${result.model} salvos.`;
        } catch (error) {
          message.textContent = error instanceof Error ? error.message : String(error);
        } finally {
          save.disabled = false;
        }
      });
    } catch (error) {
      console.warn('[KassisT Desktop] LLM provider selection unavailable:', error instanceof Error ? error.message : error);
    }
  }

  const observer = new MutationObserver(() => { void mount(); });
  function start() {
    if (!document.querySelector('.nav')) return;
    observer.observe(document.querySelector('.nav'), { subtree: true, attributes: true, attributeFilter: ['class'] });
    void mount();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
