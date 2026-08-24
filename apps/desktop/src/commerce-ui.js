(() => {
  "use strict";

  const api = window.kassist?.commerce;
  if (!api?.products?.list || !api?.orders?.list) return;

  const state = {
    loading: false,
    error: null,
    products: [],
    orders: [],
    draftProductId: "",
    draftQuantity: 1
  };

  const main = document.querySelector("#main");
  if (!main) return;

  const escapeHtml = (value) => String(value).replace(/[&<>\"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);

  const money = (amountCents, currency = "BRL") => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency
  }).format(amountCents / 100);

  const parseMoneyCents = (raw) => {
    const text = String(raw ?? "").trim();
    if (!text) return null;
    const normalized = text.includes(",")
      ? text.replace(/\./g, "").replace(",", ".")
      : text;
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
    const [whole, fraction = ""] = normalized.split(".");
    const cents = Number(`${whole}${fraction.padEnd(2, "0")}`);
    return Number.isSafeInteger(cents) ? cents : null;
  };

  const selectedPage = () => document.querySelector(".nav button.active")?.dataset.page;

  const setError = (error) => {
    state.error = error instanceof Error ? error.message : String(error);
  };

  const productPage = () => `
    <div class="toolbar">
      <div><h2 style="margin:0 0 4px">Produtos</h2><span class="badge confirmed">PERSISTED_DATA</span></div>
      <button class="btn primary" id="commerce-product-new">Novo produto</button>
    </div>
    ${state.error ? `<div class="notice" role="alert">${escapeHtml(state.error)}</div>` : ""}
    <section class="card">
      ${state.loading ? `<div class="empty">Carregando catálogo…</div>` : state.products.length === 0
        ? `<div class="empty">Nenhum produto cadastrado. Crie o primeiro produto para disponibilizar o catálogo.</div>`
        : `<table><thead><tr><th>Nome</th><th>Preço</th><th>Moeda</th></tr></thead><tbody>${state.products.map((product) => `
          <tr><td>${escapeHtml(product.name)}</td><td>${money(product.price_amount_cents, product.currency)}</td><td>${escapeHtml(product.currency)}</td></tr>
        `).join("")}</tbody></table>`}
    </section>
    <p class="muted" style="margin-top:12px">O catálogo exibido vem do SQLite canônico. Alterações de produto ainda não possuem contrato de atualização aprovado neste slice.</p>
  `;

  const orderPage = () => `
    <div class="toolbar">
      <div><h2 style="margin:0 0 4px">Pedidos</h2><span class="badge confirmed">DOMAIN_BACKED</span></div>
      <button class="btn primary" id="commerce-order-new" ${state.products.length === 0 ? "disabled" : ""}>Novo pedido</button>
    </div>
    ${state.error ? `<div class="notice" role="alert">${escapeHtml(state.error)}</div>` : ""}
    <section class="card">
      ${state.loading ? `<div class="empty">Carregando pedidos…</div>` : state.orders.length === 0
        ? `<div class="empty">Nenhum pedido persistido.</div>`
        : `<table><thead><tr><th>ID</th><th>Status</th><th>Itens</th><th>Total</th><th>Ação</th></tr></thead><tbody>${state.orders.map((order) => `
          <tr><td class="mono">${escapeHtml(order.id)}</td><td><span class="badge ${order.status === "CONFIRMED" ? "confirmed" : "unknown"}">${escapeHtml(order.status)}</span></td><td>${order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td>${money(order.total_amount_cents, order.currency)}</td><td>${order.status === "DRAFT" ? `<button class="btn" data-confirm-order="${escapeHtml(order.id)}">Confirmar</button>` : "—"}</td></tr>
        `).join("")}</tbody></table>`}
    </section>
  `;

  const render = () => {
    if (selectedPage() === "products") main.innerHTML = productPage();
    else if (selectedPage() === "orders") main.innerHTML = orderPage();
    else return;
    bind();
  };

  const loadProducts = async () => {
    state.loading = true;
    state.error = null;
    render();
    try {
      state.products = await api.products.list();
      if (!state.draftProductId && state.products[0]) state.draftProductId = state.products[0].id;
    } catch (error) {
      setError(error);
    } finally {
      state.loading = false;
      render();
    }
  };

  const loadOrders = async () => {
    state.loading = true;
    state.error = null;
    render();
    try {
      state.orders = await api.orders.list();
    } catch (error) {
      setError(error);
    } finally {
      state.loading = false;
      render();
    }
  };

  const showProductDialog = () => {
    const root = document.querySelector("#dialog-root");
    root.innerHTML = `<div class="dialog-backdrop"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="commerce-product-title">
      <h2 id="commerce-product-title">Novo produto</h2>
      <form id="commerce-product-form">
        <div class="field"><label for="commerce-product-name">Nome</label><input id="commerce-product-name" name="name" maxlength="120" required /></div>
        <div class="field"><label for="commerce-product-price">Preço (R$)</label><input id="commerce-product-price" name="price" inputmode="decimal" placeholder="0,00" required /></div>
        <div id="commerce-product-error" class="error" role="alert"></div>
        <button class="btn primary" type="submit">Salvar produto</button> <button class="btn" type="button" id="commerce-product-cancel">Cancelar</button>
      </form>
    </section></div>`;

    document.querySelector("#commerce-product-cancel")?.addEventListener("click", () => { root.innerHTML = ""; });
    document.querySelector("#commerce-product-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const name = form.elements.name.value.trim();
      const price = parseMoneyCents(form.elements.price.value);
      const errorNode = document.querySelector("#commerce-product-error");
      if (price === null) {
        errorNode.textContent = "Informe um preço válido com até 2 casas decimais.";
        return;
      }
      const submit = form.querySelector("button[type=submit]");
      submit.disabled = true;
      errorNode.textContent = "";
      try {
        await api.products.create({ name, price_amount_cents: price });
        root.innerHTML = "";
        await loadProducts();
      } catch (error) {
        errorNode.textContent = error instanceof Error ? error.message : "Falha ao salvar produto.";
      } finally {
        submit.disabled = false;
      }
    });
  };

  const showOrderDialog = () => {
    const root = document.querySelector("#dialog-root");
    root.innerHTML = `<div class="dialog-backdrop"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="commerce-order-title">
      <h2 id="commerce-order-title">Novo pedido</h2>
      <form id="commerce-order-form">
        <div class="field"><label for="commerce-order-product">Produto</label><select id="commerce-order-product" name="product">${state.products.map((p) => `<option value="${escapeHtml(p.id)}" ${p.id === state.draftProductId ? "selected" : ""}>${escapeHtml(p.name)} — ${money(p.price_amount_cents)}</option>`).join("")}</select></div>
        <div class="field"><label for="commerce-order-quantity">Quantidade</label><input id="commerce-order-quantity" name="quantity" type="number" min="1" step="1" value="${state.draftQuantity}" required /></div>
        <div id="commerce-order-error" class="error" role="alert"></div>
        <button class="btn primary" type="submit">Criar rascunho</button> <button class="btn" type="button" id="commerce-order-cancel">Cancelar</button>
      </form>
    </section></div>`;

    document.querySelector("#commerce-order-cancel")?.addEventListener("click", () => { root.innerHTML = ""; });
    document.querySelector("#commerce-order-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const productId = form.elements.product.value;
      const quantity = Number(form.elements.quantity.value);
      const errorNode = document.querySelector("#commerce-order-error");
      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        errorNode.textContent = "Quantidade deve ser um inteiro positivo.";
        return;
      }
      const submit = form.querySelector("button[type=submit]");
      submit.disabled = true;
      errorNode.textContent = "";
      try {
        await api.orders.createDraft({ items: [{ product_id: productId, quantity }] });
        root.innerHTML = "";
        await loadOrders();
      } catch (error) {
        errorNode.textContent = error instanceof Error ? error.message : "Falha ao criar pedido.";
      } finally {
        submit.disabled = false;
      }
    });
  };

  const confirm = async (orderId) => {
    const order = state.orders.find((candidate) => candidate.id === orderId);
    if (!order || order.status !== "DRAFT") return;
    const summary = order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ");
    const root = document.querySelector("#dialog-root");
    root.innerHTML = `<div class="dialog-backdrop"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="commerce-confirm-title">
      <h2 id="commerce-confirm-title">Confirmar pedido</h2><p>Resumo: <strong>${escapeHtml(summary)}</strong></p><p>Total: <strong>${money(order.total_amount_cents, order.currency)}</strong></p>
      <form id="commerce-confirm-form"><label><input type="checkbox" name="confirmed" required /> Confirmo este pedido.</label><div id="commerce-confirm-error" class="error" role="alert"></div><p style="margin-top:16px"><button class="btn primary" type="submit">Confirmar</button> <button class="btn" type="button" id="commerce-confirm-cancel">Cancelar</button></p></form>
    </section></div>`;
    document.querySelector("#commerce-confirm-cancel")?.addEventListener("click", () => { root.innerHTML = ""; });
    document.querySelector("#commerce-confirm-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const errorNode = document.querySelector("#commerce-confirm-error");
      const submit = form.querySelector("button[type=submit]");
      submit.disabled = true;
      try {
        await api.orders.confirm({ order_id: orderId, final_summary: summary, confirmed: true });
        root.innerHTML = "";
        await loadOrders();
      } catch (error) {
        errorNode.textContent = error instanceof Error ? error.message : "Falha ao confirmar pedido.";
      } finally {
        submit.disabled = false;
      }
    });
  };

  const bind = () => {
    document.querySelector("#commerce-product-new")?.addEventListener("click", showProductDialog);
    document.querySelector("#commerce-order-new")?.addEventListener("click", showOrderDialog);
    document.querySelectorAll("[data-confirm-order]").forEach((button) => button.addEventListener("click", () => confirm(button.dataset.confirmOrder)));
  };

  document.querySelectorAll(".nav button").forEach((button) => {
    button.addEventListener("click", () => setTimeout(async () => {
      if (selectedPage() === "products") await loadProducts();
      else if (selectedPage() === "orders") {
        if (state.products.length === 0) await loadProducts();
        await loadOrders();
      }
    }, 0));
  });

  if (selectedPage() === "products") loadProducts();
  if (selectedPage() === "orders") Promise.all([loadProducts(), loadOrders()]);
})();
