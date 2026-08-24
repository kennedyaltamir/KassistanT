const { contextBridge, ipcRenderer } = require("electron");

const invoke = (channel, payload) => ipcRenderer.invoke(channel, payload);

contextBridge.exposeInMainWorld("kassist", {
  version: "bootstrap-0.1.0",
  commerce: Object.freeze({
    products: Object.freeze({
      list: () => invoke("commerce.products.list"),
      create: (input) => invoke("commerce.products.create", input)
    }),
    orders: Object.freeze({
      list: () => invoke("commerce.orders.list"),
      createDraft: (input) => invoke("commerce.orders.createDraft", input),
      confirm: (input) => invoke("commerce.orders.confirm", input)
    })
  })
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.__kassistAiPanelLoader) return;
  window.__kassistAiPanelLoader = true;
  const scripts = ["./ai-panel.js", "./llm-settings.js", "./commerce-ui.js"];
  for (const source of scripts) {
    const script = document.createElement("script");
    script.src = new URL(source, window.location.href).href;
    script.async = false;
    document.documentElement.appendChild(script);
  }
});
