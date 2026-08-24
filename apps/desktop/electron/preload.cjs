const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("kassist", {
  version: "bootstrap-0.1.0"
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.__kassistAiPanelLoader) return;
  window.__kassistAiPanelLoader = true;
  const script = document.createElement("script");
  script.src = new URL("./ai-panel.js", window.location.href).href;
  script.async = false;
  document.documentElement.appendChild(script);
});
