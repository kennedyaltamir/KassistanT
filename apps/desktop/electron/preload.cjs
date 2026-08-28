const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kassist", {
  version: "bootstrap-0.1.0",
  selectProductImage: () => ipcRenderer.invoke("kassist:select-product-image"),
  selectCampaignImage: () => ipcRenderer.invoke("kassist:select-campaign-image")
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.__kassistAiPanelLoader) return;
  window.__kassistAiPanelLoader = true;
  const scripts = ["./ai-panel.js", "./llm-settings.js"];
  for (const source of scripts) {
    const script = document.createElement("script");
    script.src = new URL(source, window.location.href).href;
    script.async = false;
    document.documentElement.appendChild(script);
  }
});
