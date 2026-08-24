# IA-06 Device Lifecycle Matrix

Status: CONTRACT READINESS AUDIT; no runtime implementation.

## Device identity fields

| Field | Type | Nullable | Uniqueness | Persistence | Evidence | Status |
|---|---|---|---|---|---|---|
| `device_id` | identifier; exact scalar type not specified | NOT SPECIFIED | Expected device identity uniqueness; exact DB constraint not defined here | Canonical `Device` entity | Domain entity inventory | PARTIAL |
| `store_id` | identifier; exact scalar type not specified | NOT SPECIFIED | Device is associated with Store | Canonical entity/scoping | Baseline/domain | PARTIAL |
| `public_key` | Ed25519 public key; representation unspecified | NOT SPECIFIED | Exact uniqueness rule not specified | Device persistence expected | Enrollment/auth contracts | PARTIAL |
| `key_algorithm` | algorithm identifier; exact field not specified | UNKNOWN | UNKNOWN | UNKNOWN | Ed25519 is normative, field itself is not defined | UNKNOWN |
| `key_version` | version; exact field not specified | UNKNOWN | UNKNOWN | UNKNOWN | Rotation is named; version field is not defined | UNKNOWN |
| `device_status` | lifecycle/status value | NOT SPECIFIED | UNKNOWN | Device lifecycle expected | `REVOKED` is explicitly known | PARTIAL |
| `device_type` | field not specified | UNKNOWN | UNKNOWN | UNKNOWN | No explicit contract evidence found | UNKNOWN |
| `created_at` | timestamp; exact representation follows global UTC convention | NOT SPECIFIED | n/a | Expected | Baseline UTC persistence | PARTIAL |
| `activated_at` | field not specified | UNKNOWN | n/a | UNKNOWN | Not explicitly defined in device contract | UNKNOWN |
| `revoked_at` | field not specified | UNKNOWN | n/a | UNKNOWN | Revocation timestamp is logically relevant but not explicitly fielded | UNKNOWN |
| `rotated_at` | field not specified | UNKNOWN | n/a | UNKNOWN | Rotation exists as action; timestamp field not defined | UNKNOWN |
| `metadata` | field not specified | UNKNOWN | UNKNOWN | UNKNOWN | No normative field evidence | UNKNOWN |
| ownership | Store/Provisioning authority relationship | n/a | n/a | Device belongs to Store | Enrollment associates Store + Device + key | PARTIAL |
| lifecycle | status model | n/a | n/a | Expected in Device entity | Enrollment states plus `REVOKED` are documented; full Device lifecycle is not | PARTIAL |

## Enrollment lifecycle

Documented enrollment states: `PENDING`, `AUTHORIZED`, `COMPLETED`, `EXPIRED`, `CANCELLED`, `REVOKED`.

These are explicitly documented for the enrollment lifecycle. They must not be automatically treated as the complete Device lifecycle.

## Revoke

Approved behavior: Provisioning Service may revoke a device; revocation sets device to `REVOKED`, causes `DEVICE_REVOKED` delivery and terminates the Desktop session.

Revoke reason, exact actor payload, timestamp field, duplicate behavior, recovery semantics and HTTP response schema are not defined.

## Rotate

Rotation is authorized to the Provisioning Service, but the contract does not define:

- trigger/request schema;
- old/new key overlap;
- atomicity boundary;
- rollback;
- old-key revocation ordering;
- session continuity or forced reauthentication;
- exact lifecycle states or timestamps;
- duplicate/retry behavior.

Status: **BLOCKED**.

## Status

`GET /v1/devices/{device_id}/status` exists in the OpenAPI projection. Response schema, authorization matrix, key status and session status are incomplete.

## Readiness

Device identity persistence is **PARTIAL**. Revocation is **PARTIAL**. Rotation is **BLOCKED**. Status is **PARTIAL**.
