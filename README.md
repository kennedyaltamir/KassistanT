# KassisT

KassisT é um aplicativo desktop Windows local-first para atendimento e vendas via WhatsApp, com LLM local e núcleo de negócio determinístico.

> A IA conversa. O sistema decide.

## Architecture

```text
WhatsApp
  -> HTTPS Webhook
  -> KassisT Gateway
  -> InboundInbox
  -> WSS EVENT
  -> KassisT Desktop
  -> SQLite / Core

KassisT Desktop
  -> WSS REQUEST
  -> KassisT Gateway
  -> DomainOutbox / JobQueue
  -> External Provider
```

O Gateway transporta e integra; não contém regras comerciais. A LLM interpreta; o Core decide.

## Repository structure

- `apps/desktop` — Electron + React application boundary.
- `gateway` — public transport/integration boundary.
- `packages/domain` — domain contracts and pure business boundaries.
- `packages/contracts` — versioned protocol and event contracts.
- `packages/ui` — shared UI foundation.
- `packages/shared` — cross-cutting shared primitives.
- `docs` — versioned product, architecture, protocol, domain, AI, integration and operations documentation.
- `tests` — contract, unit, integration, E2E and security test areas.

## Development

Package manager: pnpm.

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The initial bootstrap deliberately does not claim external integrations or production behavior that has not yet been implemented and verified.

## Testing

Tests are organized around real contracts and invariants. No test file is evidence that an unimplemented subsystem is complete.

## Security

Never commit credentials, tokens, refresh tokens, client secrets or runtime secrets. Electron Renderer must remain isolated from privileged resources.

See `SECURITY.md` and `docs/architecture/security.md`.

## Documentation

The normative product/system baseline is:
`KassisT_Approved_Technical_Baseline_v1.0.1.md`.

The operational specification is also published under `docs/product/`.

## Roadmap

Bootstrap -> domain/contracts -> SQLite -> Order Engine -> AI -> Conversation Engine -> Gateway/WSS -> external integrations -> release readiness.

## Contribution

Contributions must preserve approved contracts. Architectural changes require impact analysis, ADR, version change and tests.
