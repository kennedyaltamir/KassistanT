# System Architecture

## Boundaries

```text
Renderer
  -> Preload / contextBridge
  -> Electron Main
  -> Application Services
  -> Domain / Persistence
```

The Gateway is a separate public transport/integration boundary. It must not execute pricing, discount, order, stock or conversational business rules.

## Reliability boundaries

- InboundInbox persists external inbound events before processing.
- DomainOutbox records external effects created by domain transactions.
- JobQueue owns asynchronous retryable work.
- EventBus is in-process communication, not durable storage.
- AuditLog records critical changes.

The MVP does not use Event Sourcing or an Event Store.
