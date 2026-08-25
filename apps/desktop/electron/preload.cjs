const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kassist", {
  version: "bootstrap-0.1.0",
  assistant: {
    get: () => ipcRenderer.invoke("assistant.config.get"),
    validate: (input) => ipcRenderer.invoke("assistant.config.validate", input),
    save: (input) => ipcRenderer.invoke("assistant.config.save", input)
  }
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.__kassistAiPanelLoader) return;
  window.__kassistAiPanelLoader = true;
  const scripts = ["./ai-panel.js", "./llm-settings.js", "./assistant-settings.js"];
  for (const source of scripts) {
    const script = document.createElement("script");
    script.src = new URL(source, window.location.href).href;
    script.async = false;
    document.documentElement.appendChild(script);
  }
});
