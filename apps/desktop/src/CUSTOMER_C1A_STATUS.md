# Customer C1A frontend status

- DECISION-REAL-MVP-02: APPROVED / OPTION_A
- DECISION-REAL-MVP-04: APPROVED / OPTION_C
- CUSTOMER_UI_C1A: IMPLEMENTED as an operational presentation target in the renderer integration commit.
- CUSTOMER_CORE_BY_IA08: NOT_IMPLEMENTED
- CUSTOMER_DATA_PERSISTED_BY_IA08: FALSE
- CUSTOMER_BUSINESS_OPERATION: NOT_VERIFIED
- CUSTOMER_IDENTITY_SOURCE: renderer identity is `PROVISIONAL_PRESENTATION_ID` unless explicitly supplied by an authorized real source as `ID_DERIVED_FROM_REAL_SOURCE`.
- CUSTOMER_LOOKUP_SOURCE: UNAVAILABLE
- CUSTOMER_UNIQUENESS_SOURCE: UNAVAILABLE
- PHONE_SEARCH_STATUS: PROVISIONAL_DATA only when a local provisional fixture is active; otherwise UNAVAILABLE. The UI never claims canonical lookup.
- PHONE_CANONICAL_NORMALIZATION_STATUS: UNAVAILABLE; no canonical normalization is implemented in the renderer.
- CUSTOMER_CREATE_PERSISTENCE_STATUS: UNAVAILABLE
- CUSTOMER_EDIT_PERSISTENCE_STATUS: UNAVAILABLE
- CUSTOMER_ORDER_RELATION_STATUS: PROVISIONAL_DATA only for visual selection; no `customer_id`, Order mutation or persistence is created.
- CUSTOMER_CONVERSATION_RELATION_STATUS: UNAVAILABLE without a real source.
- DASHBOARD_TEMPORAL_KPI_STATUS: DEFERRED / UNAVAILABLE
- OPEN_ORDERS_STATUS: UNAVAILABLE unless a real approved source supplies its semantics.

## Required UI distinction

`VALIDATION_SUCCESS`, `INTERACTION_SUCCESS`, `PRESENTATION_SUCCESS`, and `PERSISTENCE_SUCCESS` are separate states. A successful local interaction must never be presented as durable Customer creation or update when persistence is unavailable.

## Renderer scope

The Customer presentation surface supports list, local provisional search, detail, create interaction, edit-name interaction, selection presentation, and explicit READY/EMPTY/LOADING/ERROR/PROVISIONAL_DATA/UNAVAILABLE states. Create and edit report `INTERACTION_SUCCESS` separately from `PERSISTENCE_STATUS = UNAVAILABLE` and must not add a new record or silently mutate a record represented as durable storage.

## Dashboard and related surfaces

Temporal KPIs are deferred/unavailable under OPTION_C. `OPEN_ORDERS` is unavailable without an approved real source. Order Customer selection is presentation-only. Conversation Customer reference remains unavailable.

## Boundaries

No backend, IPC, preload, Electron Main, domain, contract, persistence, Order relationship, Conversation relationship, WhatsApp, WSS, Gateway or LLM change is authorized or implemented.
