# Security Architecture

Security boundaries are normative:

- Renderer is unprivileged.
- Preload is the only renderer bridge.
- Main owns privileged filesystem and database access.
- Secrets never enter Renderer, prompts or logs.
- Device authentication uses Ed25519 challenge-response.
- Desktop initiates outbound WSS; no public inbound Windows port.
- Supply-chain controls belong in CI/release stages.
