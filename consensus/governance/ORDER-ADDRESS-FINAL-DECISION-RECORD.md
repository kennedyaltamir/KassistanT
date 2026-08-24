# Order -> CustomerAddress — Final Semantic Decision Record

Decision ID: SCHEMA-ORDER-ADDRESS-001
Owner: ORDER_SEMANTIC_OWNER
Effective: 2026-08-24

## Decision

Order.address_id -> CustomerAddress.id is optional at draft creation and required for confirmation when the selected delivery mode requires an address.

- nullable: TRUE
- required_for_draft: FALSE
- required_for_confirmation: conditional on delivery mode
- snapshot_or_live_reference: snapshot at confirmation for the commercial delivery address
- ON DELETE: SET NULL after the confirmed snapshot exists
- ON UPDATE: RESTRICT
- lifecycle: mutable while DRAFT; commercial address meaning is frozen at confirmation

## Rationale

A draft may exist before delivery details are known. A confirmed delivery order must preserve the address used for the commercial transaction and must not change retroactively when a reusable customer address is edited.

## Schema impact

The physical schema must distinguish the source address reference from the confirmed commercial address snapshot. IA-01 materializes the required fields in the final schema; this record does not create DDL.

## Non-scope

No address versioning subsystem, geocoding requirement, automatic address merge, or new delivery rule.

## Evidence

IA-04 owns SetAddress and order confirmation lifecycle. CustomerAddress is a canonical entity in the domain inventory; detailed field schemas remain partial.
