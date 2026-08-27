# WSS Runtime V1 Requirements

Status: REQUIREMENTS PACKAGE / IMPLEMENTATION BLOCKED
Date: 2026-08-24

## Purpose

Define only the minimum requirements for the first WSS connection lifecycle slice. Future replay, resync, backpressure sophistication and provider behavior must not be pulled into V1 unless explicitly required.

## REQUIRED_FOR_V1

### 1. Connection establishment

- Accept a WSS connection using the existing protocol version `1.0`.
- Bind the connection to an authenticated device/session result supplied by IA-06.
- Reject or terminate a connection when the authentication boundary reports failure or revocation.
- Produce deterministic connection state transitions.

### 2. Envelope handling

- Validate the existing WSS envelope before handing an inbound message to downstream infrastructure.
- Preserve `device_id`, `message_id`, `event_id`, `correlation_id`, `causation_id`, `sequence` and payload exactly as contractually supplied.
- Do not invent stricter lexical constraints not present in the protected contract.

### 3. Durable inbound boundary

- Hand validated inbound events to IA-03.
- Do not persist Inbox state locally in IA-07.
- Emit ACK only from an IA-03-approved durable intake result.
- Never treat ACK as business-processing completion.

### 4. Basic disconnect/reconnect boundary

- Represent connected/disconnected lifecycle states needed by the transport.
- Follow the approved IA-06 reconnect/reauthentication rule.
- Do not invent session reuse or session renewal behavior.

### 5. Minimal error handling

- Use the existing public error envelope fields.
- Keep connection/session effects explicit for authentication and transport failures.
- Do not create a new global error catalogue.

## FUTURE

- Full replay retention policy.
- State-sync snapshot implementation.
- Reconciliation implementation.
- Detailed audit projections.
- Advanced backpressure tuning.
- Provider-specific webhook processing.
- External deployment automation.

## DEFERRED

The following may be explicitly deferred for a first lifecycle slice if the integration authority approves the scope:

- replay/resume runtime, provided no acknowledged delivery contract requires it in V1;
- resync/state-sync runtime;
- advanced backpressure thresholds;
- reconnect jitter algorithm beyond the contractually required boundary;
- application-level command routing.

## OPTIONAL

- Additional observability beyond the minimum correlation/connection state evidence.
- Operational metrics that do not alter protocol semantics.

## BLOCKED

- Session manager implementation before IA-06 session contract.
- ACK implementation before IA-03 durable intake contract.
- Sequence-based replay behavior before sequence persistence/ownership is closed.
- Backpressure runtime before minimum pressure semantics are approved.

## Minimum V1 test gate

Before the lifecycle implementation can be considered ready:

1. authenticated connection success;
2. authentication failure;
3. revocation-triggered termination;
4. validated inbound event handoff;
5. persistence failure with no ACK;
6. successful durable intake followed by ACK authorization;
7. duplicate event behavior;
8. reconnect behavior according to IA-06 contract;
9. correlation/causation preservation;
10. deterministic connection error mapping.

These tests cannot be finalized until IA-06 and IA-03 expose the corresponding executable interfaces.
