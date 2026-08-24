# IA-06 Device Authorization Matrix

Status: BLOCKED / PARTIAL. This document records existing authority only; it does not create permissions.

| Actor | Action | Resource | Condition | Permission | Evidence | Status |
|---|---|---|---|---|---|---|
| Provisioning Service | authorize enrollment | enrollment/device | authenticated as Provisioning Service | Authorized | Backend authorization contract | READY AS AUTHORITY FACT |
| Provisioning Service | revoke | device | authorized operation | Allowed | Backend authorization contract + baseline | READY AS AUTHORITY FACT |
| Provisioning Service | rotate key | device key | authorized operation | Allowed | Backend authorization contract + baseline | READY AS AUTHORITY FACT |
| Provisioning Service | read status | device | authorized operation | Allowed | Backend authorization contract | READY AS AUTHORITY FACT |
| Desktop device | authenticate | own device session | valid Ed25519 proof of possession | Authentication capability, not general management authority | Device-auth/WSS contract | PARTIAL |
| Desktop device | use session | session | successfully authenticated | Allowed only after authentication; exact session authorization not defined | WSS/auth contracts | PARTIAL/BLOCKED |
| Unknown actor | start enrollment | enrollment | endpoint-specific authz missing | UNKNOWN | Enrollment contract partial | BLOCKED |
| Unknown actor | complete enrollment | enrollment | endpoint-specific authz missing | UNKNOWN | Enrollment contract partial | BLOCKED |
| Unknown actor | cancel enrollment | enrollment | endpoint-specific authz missing | UNKNOWN | Enrollment contract partial | BLOCKED |
| Unknown actor | access status | device | endpoint-specific authz missing | UNKNOWN | Status endpoint partial | BLOCKED |

## Authentication vs authorization

Authentication establishes a device identity by proof of possession of the registered key. It does **not** establish permission to perform provisioning operations.

The repository explicitly gives the Provisioning Service authority for enrollment authorization, revoke, rotate and device-status reads. It does not provide a complete endpoint-by-endpoint matrix.

## Missing authorization dimensions

The following are not sufficiently specified and must not be invented:

- how the Provisioning Service authenticates;
- exact credential/scope required per endpoint;
- whether the authenticated device may perform any management action on itself;
- Store scoping checks for management operations;
- authorization failure status/code mapping;
- whether status is visible to the authenticated device or only Provisioning Service;
- rate-limit identity used for authorization failures.

## Gate

Implementation is **BLOCKED** until the endpoint authorization matrix is approved. The minimum contract must distinguish identity, actor, resource, action, Store scope and failure semantics.
