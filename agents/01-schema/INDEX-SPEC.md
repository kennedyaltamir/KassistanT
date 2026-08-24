# IA-01 — Index Specification

## Index policy

The baseline explicitly defines seven unique constraints. Those unique constraints are the only current indexes that are `REQUIRED_BY_CONTRACT`. Non-unique performance indexes are not authorized merely because a query is foreseeable.

| # | Table/entity | Columns | Unique | Classification | Purpose | Evidence | Status |
|---:|---|---|---|---|---|---|---|
| 1 | Customer | `store_id, phone_normalized` | YES | REQUIRED_BY_CONTRACT | customer identity/deduplication | Baseline §23.1 | FROZEN |
| 2 | Conversation | `store_id, external_thread_id` | YES | REQUIRED_BY_CONTRACT | external thread deduplication | Baseline §23.1 | FROZEN |
| 3 | Message | `store_id, external_message_id` | YES | REQUIRED_BY_CONTRACT | external message deduplication | Baseline §23.1 | FROZEN |
| 4 | InboundInbox | `provider, external_event_id` | YES | REQUIRED_BY_CONTRACT | inbound event deduplication | Baseline §23.1 | FROZEN |
| 5 | DomainOutbox | `idempotency_key` | YES | REQUIRED_BY_CONTRACT | outbound effect idempotency | Baseline §23.1 | BLOCKED by CONTRACT-001 |
| 6 | Order | `store_id, display_number` | YES | REQUIRED_BY_CONTRACT | per-store operational order identity | Baseline §23.1 | FROZEN |
| 7 | Device | `store_id, id` | YES | REQUIRED_BY_CONTRACT | per-store device identity | Baseline §23.1 | FROZEN |

## Relationship indexes

FK-supporting non-unique indexes are currently `UNKNOWN`/`PROPOSED`. The contract states relational structures but does not prescribe physical performance indexes beyond the seven uniqueness declarations.

Do not add indexes for:

- every `store_id`;
- every FK;
- every status column;
- every timestamp;
- expected dashboard queries;

until query contracts or an approved performance decision establishes them.
