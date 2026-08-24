# Customer C1A frontend status

- DECISION-REAL-MVP-02: APPROVED / OPTION_A
- DECISION-REAL-MVP-04: APPROVED / OPTION_C
- CUSTOMER_CORE_BY_IA08: NOT_IMPLEMENTED
- CUSTOMER_DATA_PERSISTED_BY_IA08: FALSE
- CUSTOMER_BUSINESS_OPERATION: NOT_VERIFIED
- CUSTOMER_IDENTITY_SOURCE: renderer identity is `PROVISIONAL_PRESENTATION_ID` unless explicitly supplied by an authorized real source as `ID_DERIVED_FROM_REAL_SOURCE`.
- CUSTOMER_LOOKUP_SOURCE: UNAVAILABLE
- CUSTOMER_UNIQUENESS_SOURCE: UNAVAILABLE
- PHONE_CANONICAL_NORMALIZATION_STATUS: UNAVAILABLE; no canonical normalization is implemented in the renderer.
- CUSTOMER_CREATE_PERSISTENCE_STATUS: UNAVAILABLE
- CUSTOMER_EDIT_PERSISTENCE_STATUS: UNAVAILABLE
- CUSTOMER_ORDER_RELATION_STATUS: UNAVAILABLE without an approved relation contract.
- CUSTOMER_CONVERSATION_RELATION_STATUS: UNAVAILABLE without a real source.
- DASHBOARD_TEMPORAL_KPI_STATUS: DEFERRED / UNAVAILABLE
- OPEN_ORDERS_STATUS: UNAVAILABLE unless a real approved source supplies its semantics.

## Required UI distinction

`VALIDATION_SUCCESS`, `INTERACTION_SUCCESS`, `PRESENTATION_SUCCESS`, and `PERSISTENCE_SUCCESS` are separate states. A successful local interaction must never be presented as durable Customer creation or update when persistence is unavailable.

## Current gap

The existing renderer is a single self-contained `index.html` with Customer navigation and only a minimal provisional client table. The presentation model added in `main.tsx` establishes the C1A state boundary, but the full Customer create/edit/search/detail state machine still requires incremental integration into that renderer file. No backend, IPC, preload, domain, contract, persistence, Order relation, or Conversation relation change is authorized or implemented.
