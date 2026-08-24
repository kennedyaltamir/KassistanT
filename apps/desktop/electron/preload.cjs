const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kassist", {
  version: "bootstrap-0.1.0",
  runtime: {
    getInfo: () => ipcRenderer.invoke("kassist:runtime-info")
  }
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.__kassistAiPanelLoader) return;
  window.__kassistAiPanelLoader = true;
  const scripts = ["./ai-panel.js", "./llm-settings.js", "./frontend-runtime.js"];
  for (const source of scripts) {
    const script = document.createElement("script");
    script.src = new URL(source, window.location.href).href;
    script.async = false;
    document.documentElement.appendChild(script);
  }
});
