# IA-03 — Human EventBus Decision Package

## EXECUTIVE_SUMMARY

Status: `APPROVED / IMPLEMENTED`

The operator explicitly approved EBUS-DEC-001 through EBUS-DEC-008. IA-03 implemented the approved in-process EventBus V1 within the authorized territory and validated its directly associated deterministic tests.

The approved local policies are intentionally bounded: in-process, post-commit, non-durable, no durable retry, no ordering guarantee, isolated subscriber failures, aggregate failure reporting, opaque subscriptions, idempotent unsubscribe, snapshot dispatch, unsubscribe-only cancellation and no V1 timeout.

No global contract was modified. `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain open.

## APPROVED_DECISIONS

- `EBUS-DEC-001`: subscriber failures are isolated and aggregated after all selected handlers settle.
- `EBUS-DEC-002`: one subscriber failure does not prevent later selected subscribers from executing.
- `EBUS-DEC-003`: `publish()` is asynchronous and awaits selected handlers sequentially over a publish-time snapshot.
- `EBUS-DEC-004`: subscriptions have opaque identities and unsubscribe is idempotent.
- `EBUS-DEC-005`: cancellation is unsubscribe-only; no `AbortSignal` in V1.
- `EBUS-DEC-006`: no EventBus-owned timeout in V1.
- `EBUS-DEC-007`: `await publish()` completes after all selected handlers settle.
- `EBUS-DEC-008`: dispatch uses a snapshot and each distinct subscription executes at most once per dispatch.

`EBUS-DEC-009` is the consolidated consequence of these approved policies and is not a separate approval gate.

## IMPLEMENTED_RESULT

Runtime files:

- `apps/desktop/electron/infrastructure/events/event-bus.ts`
- `apps/desktop/electron/infrastructure/events/event-bus.test.ts`

Validation:

- 10 tests passed;
- 0 failed;
- 0 cancelled;
- 0 skipped.

Static TypeScript validation of the EventBus implementation and protected event contract subset also passed with `tsc --noEmit --strict` in the isolated validation environment.

## PROPOSED_EVENTBUS_V1_CONTRACT

The previously proposed contract is now the approved IA-03 local implementation policy. It is not a replacement for `packages/contracts/**`.

```ts
subscribe(eventType: DomainEventType, handler: EventHandler): Subscription;
unsubscribe(subscription: Subscription): void;
publish(event: DomainEvent): Promise<DispatchResult>;
```

## NON_BLOCKING_GAPS

- V1 has no timeout.
- V1 has no `AbortSignal`.
- No global EventBus metrics schema was introduced.
- Downstream consumer integration remains a later milestone.

## RISK_IF_IMPLEMENTED_TOO_EARLY

This risk was mitigated by requiring and recording explicit operator approval before implementation.

## FINAL_RESULT

`EVENTBUS_RUNTIME_STATUS = IMPLEMENTED_AND_TESTED`
