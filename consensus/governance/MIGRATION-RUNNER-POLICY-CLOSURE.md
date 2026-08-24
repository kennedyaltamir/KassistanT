# Migration Runner Policy Closure

Status: **IMPLEMENTED_PENDING_VERIFICATION**

Implementation point: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`.

## Policy

Migration discovery remains filename-based so all matching artifacts remain visible for audit and provenance.

Execution is classification-based and fail-closed:

| Migration | Authority | Canonical execution |
|---|---|---|
| `0001_bootstrap` | `AUTHORITATIVE` | YES |
| `0002_c1_product_order` | `HISTORICAL_NON_AUTHORITATIVE` | NO |
| any future unclassified migration | `UNCLASSIFIED` | BLOCK |

`HISTORICAL_NON_AUTHORITATIVE` artifacts remain discoverable and are checksumed, but are never passed to the execution loop.

## Metadata

`_schema_migrations` continues to record only migrations that were actually executed. No schema migration file is modified to encode authority.

The existing `_schema_metadata.schema_version` therefore reflects the highest authoritative schema transition actually executed in the current chain.

## Safety properties

- Migration 0002 is preserved unchanged.
- Migration 0002 cannot execute through the canonical runner.
- Unknown future migrations cannot execute implicitly.
- Authoritative migrations remain ordered deterministically by discovery order.
- Re-running the runner is idempotent through the existing checksum ledger.

## Verification boundary

This closure does not execute production databases and does not modify domain schema, contracts, Gateway or frontend behavior.
