# Notification Provider Contract

Provider: `NotificationProvider`.
Status: DEFINED / PARTIAL / EXTERNAL.

Local notification is mandatory for MVP. External delivery is provider-dependent and not frozen. Domain emits business events; provider performs delivery. Baseline defines `notification_key = order_id + channel + template_version` for delivery idempotency.
