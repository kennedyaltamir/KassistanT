(() => {
  const GATEWAY = 'http://127.0.0.1:3210';
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const money = (cents) => `R$ ${(Number(cents || 0) / 100).toFixed(2).replace('.', ',')}`;
  async function api(path, options = {}) {
    const response = await fetch(GATEWAY + path, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
    return body;
  }
  function activePage() { return document.querySelector('.nav button.active')?.dataset?.page || ''; }
  const observer = new MutationObserver(() => { const page = activePage(); if (page === 'products') renderProducts(); else if (page === 'clients') renderClients(); else if (page === 'orders') renderOrders(); else if (page === 'dashboard') renderDashboard(); });
  let rendering = false;

  async function renderDashboard() {
    if (rendering || activePage() !== 'dashboard') return;
    rendering = true;
    try {
      const d = await api('/api/dashboard'); const main = document.querySelector('#main'); if (!main || activePage() !== 'dashboard') return;
      main.innerHTML = `<div class="toolbar"><div><h2>Visão geral</h2><p class="muted">Indicadores derivados do banco operacional.</p></div></div><div class="grid grid-4"><div class="card stat"><div class="stat-label">WhatsApp</div><div class="stat-value">carregando…</div><div class="stat-note">Abra Conversas para conectar.</div></div><div class="card stat"><div class="stat-label">Clientes</div><div class="stat-value">${d.customers}</div><div class="stat-note">cadastros reais</div></div><div class="card stat"><div class="stat-label">Mensagens hoje</div><div class="stat-value">${d.messagesToday}</div><div class="stat-note">persistidas</div></div><div class="card stat"><div class="stat-label">Vendas hoje</div><div class="stat-value">${money(d.salesToday?.totalCents)}</div><div class="stat-note">${d.salesToday?.count || 0} pedido(s)</div></div></div><section class="card" style="margin-top:16px"><div class="card-body"><h3>Pedidos em andamento</h3><p class="stat-value">${d.pendingOrders}</p></div></section>`;
    } catch (error) { console.error('[KassisT UI] dashboard', error); } finally { rendering = false; }
  }

  async function renderProducts() {
    if (rendering || activePage() !== 'products') return;
    rendering = true;
    try {
      const data = await api('/api/catalog/products'); const main = document.querySelector('#main'); if (!main || activePage() !== 'products') return;
      const rows = (data.products || []).map((p) => `<tr><td>${esc(p.name)}</td><td>${money(p.price_cents)}</td><td>${p.available ? '<span class="badge ok">ATIVO</span>' : '<span class="badge">INATIVO</span>'}</td><td>${p.image_path ? '<span class="badge info">FOTO</span>' : '—'}</td><td><button class="btn" data-product-edit="${esc(p.id)}">Editar</button> <button class="btn danger" data-product-delete="${esc(p.id)}">Desativar</button></td></tr>`).join('');
      main.innerHTML = `<div class="toolbar"><div><h2>Produtos</h2><p class="muted">Catálogo persistido no SQLite e usado pelo contexto da IA.</p></div><button class="btn primary" id="product-new">Novo produto</button></div><section class="card"><div class="card-body"><form id="product-form" class="grid grid-4" style="display:none"><input type="hidden" id="product-id"><div class="field"><label>Nome</label><input id="product-name" required></div><div class="field"><label>Preço em centavos</label><input id="product-price" type="number" min="0" required></div><div class="field"><label>Descrição</label><input id="product-description"></div><div class="field"><label>Caminho da foto no Windows</label><input id="product-image" placeholder="C:\\...\\produto.jpg"></div><div class="actions"><button class="btn primary" type="submit">Salvar</button><button class="btn" type="button" id="product-cancel">Cancelar</button></div></form><div class="table-wrap"><table class="table"><thead><tr><th>Produto</th><th>Preço</th><th>Estado</th><th>Foto</th><th>Ações</th></tr></thead><tbody>${rows || '<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>'}</tbody></table></div></div></section>`;
      const form = document.querySelector('#product-form'); const clear = () => { form.style.display='none'; form.reset(); document.querySelector('#product-id').value=''; };
      document.querySelector('#product-new')?.addEventListener('click', () => { form.style.display='grid'; }); document.querySelector('#product-cancel')?.addEventListener('click', clear);
      document.querySelectorAll('[data-product-edit]').forEach((button) => button.addEventListener('click', async () => { const p = (data.products || []).find((item) => item.id === button.dataset.productEdit); if (!p) return; form.style.display='grid'; document.querySelector('#product-id').value=p.id; document.querySelector('#product-name').value=p.name; document.querySelector('#product-price').value=p.price_cents; document.querySelector('#product-description').value=p.description || ''; document.querySelector('#product-image').value=p.image_path || ''; }));
      document.querySelectorAll('[data-product-delete]').forEach((button) => button.addEventListener('click', async () => { await api(`/api/catalog/products/${encodeURIComponent(button.dataset.productDelete)}`, { method:'DELETE' }); await renderProducts(); }));
      form.addEventListener('submit', async (event) => { event.preventDefault(); const id=document.querySelector('#product-id').value; const payload={name:document.querySelector('#product-name').value,price_cents:Number(document.querySelector('#product-price').value),description:document.querySelector('#product-description').value,image_path:document.querySelector('#product-image').value || null}; await api(id ? `/api/catalog/products/${encodeURIComponent(id)}` : '/api/catalog/products', { method:id?'PUT':'POST', body:JSON.stringify(payload) }); await renderProducts(); });
    } catch (error) { const main=document.querySelector('#main'); if (main) main.innerHTML=`<div class="notice error">${esc(error.message || error)}</div>`; } finally { rendering = false; }
  }

  async function renderClients() {
    if (rendering || activePage() !== 'clients') return;
    rendering = true;
    try { const data=await api('/api/customers'); const main=document.querySelector('#main'); if (!main || activePage() !== 'clients') return; const rows=(data.customers||[]).map((c)=>`<tr><td>${esc(c.name || 'Sem nome')}</td><td class="mono">${esc(c.phone_normalized)}</td><td>${esc(c.email || '—')}</td><td>${c.order_count}</td><td>${money(c.total_spent_cents)}</td></tr>`).join(''); main.innerHTML=`<div class="toolbar"><div><h2>Clientes</h2><p class="muted">Cadastros criados/atualizados a partir do atendimento e pedidos.</p></div></div><section class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Nome</th><th>Telefone</th><th>E-mail</th><th>Pedidos</th><th>Total</th></tr></thead><tbody>${rows || '<tr><td colspan="5">Nenhum cliente.</td></tr>'}</tbody></table></div></section>`; } catch(error) { console.error('[KassisT UI] clients', error); } finally { rendering=false; }
  }
  async function renderOrders() {
    if (rendering || activePage() !== 'orders') return;
    rendering = true;
    try { const data=await api('/api/orders'); const main=document.querySelector('#main'); if (!main || activePage() !== 'orders') return; const rows=(data.orders||[]).map((o)=>`<tr><td>#${esc(o.display_number)}</td><td>${esc(o.customer_name || o.phone_normalized)}</td><td>${esc(o.lifecycle_state)}</td><td>${esc(o.delivery_type)}</td><td>${money(o.delivery_fee_cents)}</td><td>${money(o.total_cents)}</td><td>${esc(o.created_at)}</td></tr>`).join(''); main.innerHTML=`<div class="toolbar"><div><h2>Pedidos</h2><p class="muted">Pedidos confirmados pelo motor comercial.</p></div></div><section class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Número</th><th>Cliente</th><th>Status</th><th>Entrega</th><th>Taxa</th><th>Total</th><th>Criado</th></tr></thead><tbody>${rows || '<tr><td colspan="7">Nenhum pedido.</td></tr>'}</tbody></table></div></section>`; } catch(error) { console.error('[KassisT UI] orders', error); } finally { rendering=false; }
  }

  function boot() { observer.observe(document.body, { childList:true, subtree:true }); setTimeout(() => { if (activePage()==='dashboard') renderDashboard(); }, 250); }
  boot();
})();
