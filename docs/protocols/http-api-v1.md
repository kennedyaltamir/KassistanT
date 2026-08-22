# HTTP API v1

Status: DEFINED / PARTIAL. Source: `KassisT_Approved_Technical_Baseline_v1.0.1.md`, §70.

## Normative route inventory

| ID | Method | Path | Status |
|---|---|---|---|
| GW-001 | GET | `/health` | DEFINED / PARTIAL |
| GW-002 | GET | `/ready` | DEFINED / PARTIAL |
| GW-003 | GET | `/webhooks/whatsapp` | DEFINED / PARTIAL / EXTERNAL |
| GW-004 | POST | `/webhooks/whatsapp` | DEFINED / PARTIAL / EXTERNAL |
| GW-005 | POST | `/v1/devices/enrollment/start` | DEFINED / PARTIAL |
| GW-006 | POST | `/v1/devices/enrollment/complete` | DEFINED / PARTIAL |
| GW-007 | POST | `/v1/devices/enrollment/cancel` | DEFINED / PARTIAL |
| GW-008 | POST | `/v1/devices/revoke` | DEFINED / PARTIAL |
| GW-009 | POST | `/v1/devices/rotate` | DEFINED / PARTIAL |
| GW-010 | GET | `/v1/devices/{device_id}/status` | DEFINED / PARTIAL |

The baseline defines the canonical error envelope with `error.code`, `error.message`, `error.retryable` and `error.correlation_id`. Stack traces are not exposed. Request/response schemas, detailed status matrices, endpoint authorization, timeout values, rate values and exact retry/idempotency rules are PARTIAL/MISSING unless explicitly defined elsewhere. No fictitious schema is introduced.

Runtime status: NOT_IMPLEMENTED in the audited Gateway skeleton.
