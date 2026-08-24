# Domain Events

Status: DEFINED / AMBIGUOUS.

Baseline defines message, conversation, AI, order, customer, Google, notification, sound, integration and system events. `order.status_changed` is contradictory: baseline excludes it from the catalogue in one section and refers to it later as a possible lifecycle event; current TypeScript contracts include it. This remains CONTRACT-002.

Event envelope: event_id, event_name, event_version, aggregate_type, aggregate_id, occurred_at, producer, correlation_id, causation_id, schema and payload.