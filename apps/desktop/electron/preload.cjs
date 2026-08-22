const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("kassist", {
  version: "bootstrap-0.1.0"
});
