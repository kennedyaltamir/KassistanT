const steps = [
  { id: "conversation", label: "Conversa" },
  { id: "product", label: "Produto" },
  { id: "review", label: "Revisão do pedido" },
  { id: "address", label: "Endereço" },
  { id: "payment", label: "Pagamento" },
  { id: "confirmation", label: "Confirmação" },
  { id: "result", label: "Resultado" }
];

const state = {
  current: "conversation",
  submitting: false,
  coreReady: false
};

const root = document.querySelector("#app");

function render() {
  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" aria-label="Etapas da venda">
        <div class="brand">KassisT</div>
        <nav class="flow">
          ${steps.map((step) => `
            <button class="flow-step" type="button" data-step="${step.id}" aria-current="${step.id === state.current ? "step" : "false"}" data-complete="${steps.findIndex((item) => item.id === step.id) < steps.findIndex((item) => item.id === state.current)}">
              ${step.label}
            </button>
          `).join("")}
        </nav>
      </aside>

      <main class="main">
        <header class="topbar">
          <strong>Primeira venda</strong>
          <div class="status" role="status" aria-live="polite">
            <span class="status-dot"></span>
            ${state.coreReady ? "Core conectado" : "Aguardando Core"}
          </div>
        </header>

        <section class="content">
          ${renderScreen()}
        </section>
      </main>
    </div>
  `;

  root.querySelectorAll("[data-step]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.step));
  });

  const back = root.querySelector("[data-action=back]");
  if (back) back.addEventListener("click", () => navigate(previousStep()));

  const next = root.querySelector("[data-action=next]");
  if (next) next.addEventListener("click", () => navigate(nextStep()));

  const confirm = root.querySelector("[data-action=confirm]");
  if (confirm) confirm.addEventListener("click", confirmOrder);
}

function renderScreen() {
  switch (state.current) {
    case "conversation":
      return screen("Conversa", "Conduza a operação comercial a partir da conversa recebida.", `
        <div class="card"><div class="card-body">
          <p class="section-title">Thread comercial</p>
          <div class="empty">
            <strong>Nenhuma conversa disponível</strong>
            A conversa real será fornecida pelo Core através do contrato de aplicação. Esta tela não cria ou simula mensagens.
          </div>
          ${notice()}
          <div class="actions"><span></span><button class="btn btn-primary" type="button" data-action="next">Avançar</button></div>
        </div></div>
      `);
    case "product":
      return screen("Produto", "Selecione apenas produtos retornados pelo Core.", `
        <div class="card"><div class="card-body">
          <p class="section-title">Catálogo</p>
          <div class="empty">
            <strong>Nenhum produto carregado</strong>
            A UX não mantém catálogo, preço ou disponibilidade próprios.
          </div>
          <div class="actions"><button class="btn" type="button" data-action="back">Voltar</button><button class="btn btn-primary" type="button" data-action="next">Avançar</button></div>
        </div></div>
      `);
    case "review":
      return screen("Revisão do pedido", "Revise o snapshot comercial devolvido pelo Core.", `
        <div class="grid-2">
          <div class="card"><div class="card-body">
            <p class="section-title">Itens</p>
            <div class="empty"><strong>Aguardando Core</strong>O frontend não calcula subtotal, desconto ou total.</div>
          </div></div>
          <div class="card"><div class="card-body">
            <p class="section-title">Resumo comercial</p>
            <div class="summary-row"><span>Preço</span><strong>—</strong></div>
            <div class="summary-row"><span>Desconto</span><strong>—</strong></div>
            <div class="summary-row"><span>Total</span><strong>—</strong></div>
          </div></div>
        </div>
        <div class="actions"><button class="btn" type="button" data-action="back">Voltar</button><button class="btn btn-primary" type="button" data-action="next">Avançar</button></div>
      `);
    case "address":
      return screen("Endereço", "Capture ou selecione o endereço resolvido pelo domínio.", `
        <div class="card"><div class="card-body">
          <div class="grid-2">
            <div class="field"><label for="street">Logradouro</label><input id="street" name="street" autocomplete="street-address" /></div>
            <div class="field"><label for="number">Número</label><input id="number" name="number" inputmode="numeric" /></div>
            <div class="field"><label for="district">Bairro</label><input id="district" name="district" /></div>
            <div class="field"><label for="city">Cidade</label><input id="city" name="city" autocomplete="address-level2" /></div>
          </div>
          ${notice()}
          <div class="actions"><button class="btn" type="button" data-action="back">Voltar</button><button class="btn btn-primary" type="button" data-action="next">Avançar</button></div>
        </div></div>
      `);
    case "payment":
      return screen("Pagamento", "Escolha somente uma opção retornada pelo Core.", `
        <div class="card"><div class="card-body">
          <div class="empty"><strong>Nenhum método disponível</strong>A resolução de PaymentMethod pertence ao Core.</div>
          <div class="actions"><button class="btn" type="button" data-action="back">Voltar</button><button class="btn btn-primary" type="button" data-action="next">Avançar</button></div>
        </div></div>
      `);
    case "confirmation":
      return screen("Confirmação", "Confirme apenas quando o Core fornecer um resultado comercial válido.", `
        <div class="card"><div class="card-body">
          <div class="empty"><strong>${state.coreReady ? "Pedido pronto para confirmação" : "Confirmação bloqueada"}</strong>${state.coreReady ? "O estado comercial veio do Core." : "Não existe resultado comercial disponível para confirmar sem backend real."}</div>
          <div class="actions"><button class="btn" type="button" data-action="back">Voltar</button><button class="btn btn-primary" type="button" data-action="confirm" ${!state.coreReady || state.submitting ? "disabled" : ""}>${state.submitting ? "Confirmando…" : "Confirmar pedido"}</button></div>
        </div></div>
      `);
    case "result":
      return `
        <div class="center-state"><div class="result">
          <div class="result-badge">!</div>
          <p class="eyebrow">Resultado</p>
          <h1>Sem resultado comercial</h1>
          <p class="subtitle">A UX não fabrica sucesso. O resultado desta operação aparecerá somente após uma confirmação real do Core.</p>
          ${notice()}
          <div class="actions"><span></span><button class="btn" type="button" data-action="back">Voltar</button></div>
        </div></div>
      `;
    default:
      return "";
  }
}

function screen(title, subtitle, body) {
  return `<p class="eyebrow">Primeira venda</p><h1>${title}</h1><p class="subtitle">${subtitle}</p>${body}`;
}

function notice() {
  return `<div class="notice" role="note">Dados comerciais, disponibilidade, preço e estado de confirmação pertencem ao Core. Esta camada visual não os recalcula.</div>`;
}

function nextStep() {
  const index = steps.findIndex((step) => step.id === state.current);
  return steps[Math.min(index + 1, steps.length - 1)].id;
}

function previousStep() {
  const index = steps.findIndex((step) => step.id === state.current);
  return steps[Math.max(index - 1, 0)].id;
}

function navigate(step) {
  if (!steps.some((item) => item.id === step)) return;
  state.current = step;
  render();
}

function confirmOrder() {
  if (!state.coreReady || state.submitting) return;
  state.submitting = true;
  render();
}

render();
