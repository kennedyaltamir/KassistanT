# Security

Status: DEFINED.

Renderer is unprivileged; Preload is the bridge; Main owns privileged access. Device authentication uses Ed25519. Desktop uses outbound WSS. Secrets never enter Renderer, prompts or logs. Electron security requirements include context isolation, nodeIntegration=false, CSP and IPC/navigation controls.