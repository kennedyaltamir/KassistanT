# CONTRACT-001 — DomainOutbox Decision Package

Status: **BLOCKER / PENDING_GLOBAL_DECISION**
Authority: `OPERATOR_PROJECT_GOVERNANCE`
Baseline: `MVP2` @ `0bea2a0ca7c52729cfd58bebc8cd568373222230`

## Problem

`agents/01-schema/DECISIONS.md` registra `P-011 — CONTRACT-001 DomainOutbox ownership/scope` como decisão global pendente. `agents/02-domain/DOMAIN-GLOBAL-DECISIONS.md` registra o mesmo problema: DomainOutbox está na fronteira entre domínio e efeito externo, e ownership/transaction semantics não estão formalmente fechados.

## Required semantics under evaluation

business transaction
+
outbox intent
-> commit
-> worker
-> provider

Prohibited pattern under the proposed governance model:

persist business
-> direct provider call

A semântica acima é tratada como proposta de contrato para decisão; não é declarada aprovada por este documento.

## Real Alternatives

### Option A — Domain event intent + IA-03 durable mechanics

Domain owns business event intent; IA-03 owns durable Outbox mechanics and delivery worker, with IA-01 defining physical persistence only after semantic closure.

### Option B — IA-03 complete Outbox semantics

IA-03 owns event intent, durable representation and delivery mechanics as one integration contract.

### Option C — Other explicit boundary

Operator defines another ownership and transaction model with explicit owner, transaction semantics, idempotency, retry/recovery and provider boundary.

## Required invariant candidates

1. Business state and outbox intent are committed atomically when both belong to the same transaction boundary.
2. Provider invocation occurs only after durable intent exists.
3. Delivery is idempotent or deduplicated according to an explicit contract.
4. Recovery must be deterministic and auditable.
5. Ownership must be singular at each semantic layer; no hidden bypass path.

These are candidate invariants pending final normative closure.

## Decision State

`PENDING_GLOBAL_DECISION`.

## Release consequence

Until resolved, `CONTRACT-001` remains a blocker for any implementation that depends on durable DomainOutbox ownership or transaction semantics. It does not authorize implementation or schema changes.

## Authority separation

IA-01 may package evidence and reconcile physical schema implications.
IA-02 may provide domain semantics.
IA-03 may provide integration/runtime semantics.
The Operator closes the global normative decision.
