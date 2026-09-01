const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("kassist", {
  version: "commercial-runtime-1.0.0"
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.__kassistAiPanelLoader) return;
  window.__kassistAiPanelLoader = true;
  const scripts = ["./ai-panel.js", "./llm-settings.js", "./commercial-ui.js"];
  for (const source of scripts) {
    const script = document.createElement("script");
    script.src = new URL(source, window.location.href).href;
    script.async = false;
    document.documentElement.appendChild(script);
  }
});
