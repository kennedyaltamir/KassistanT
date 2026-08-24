(() => {
  "use strict";

  const api = window.kassist?.runtime;
  if (!api?.getInfo) return;

  const updateRuntimeIndicator = (info) => {
    const existing = document.querySelector("#kassist-runtime-status");
    const target = document.querySelector("#side-wa-status")?.parentElement;
    if (!target) return;

    const node = existing ?? document.createElement("div");
    node.id = "kassist-runtime-status";
    node.className = "side-status";
    node.setAttribute("data-source", "electron-ipc");

    const isolation = info?.contextIsolation === true ? "ON" : "OFF";
    const nodeIntegration = info?.nodeIntegration === false ? "OFF" : "ON";
    const sandbox = info?.sandbox === true ? "ON" : "OFF";

    node.innerHTML =
      `<strong>Desktop runtime</strong>` +
      `<div class="mono" style="margin-top:6px">IPC • isolation ${isolation} • nodeIntegration ${nodeIntegration} • sandbox ${sandbox}</div>`;

    if (!existing) target.appendChild(node);
  };

  api.getInfo()
    .then(updateRuntimeIndicator)
    .catch(() => updateRuntimeIndicator(null));
})();
