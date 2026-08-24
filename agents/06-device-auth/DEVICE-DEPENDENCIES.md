# IA-06 Device Dependencies

Status: READINESS AUDIT.

| Agent / boundary | IA-06 consumes | IA-06 produces / exposes | Main contract | Blocker | Integration order | Security impact |
|---|---|---|---|---|---|---|
| IA-01 | Device/Store persistence model and constraints | Required device identity fields/constraints as consumer requirements | Canonical domain entities | Canonical Device fields are partial | 1 | Prevents unsafe identity persistence assumptions |
| IA-02 | Identity/value-object and validation conventions | Device-auth validation needs | Domain conventions | Runtime domain details may not yet exist | 2 | Ensures consistent identifiers/validation |
| IA-03 | Audit/EventBus and durable event semantics | Auth/revoke audit/event requirements | Event infrastructure | CONTRACT-001 can affect durable effects | 3 | Ensures evidence and recovery boundaries |
| IA-07 | HTTP/WSS transport boundary | Device-auth handlers/messages and authentication boundary | HTTP/OpenAPI/WSS | Endpoint schemas and WSS auth payloads partial | 4 | Network trust boundary |
| IA-08 | Renderer/UI state consumption | Device state/diagnostic requirements | UI boundary | UI must not receive private key | 5 | Prevents secret exposure |
| Windows Secure Storage | Supported local secure-storage behavior | Private-key storage requirement | Baseline security boundary | Exact mechanism not specified/validated | External gate | Protects device private key |

## IA-01 interface

Required inputs are the canonical Store/Device identifiers and approved persistence fields. IA-06 must not define columns unilaterally. Device lifecycle data needed by authentication/revocation must be agreed before runtime implementation.

## IA-03 interface

Authentication and management actions need auditable evidence. Revocation is already identified as a critical audit event. The exact coupling between auth runtime and durable event infrastructure remains to be agreed.

`CONTRACT-001` is relevant only where Device Authentication would encode DomainOutbox ownership/scope. IA-06 does not resolve it.

## IA-07 interface

IA-06 owns `gateway/src/device-auth/**`; IA-07 owns the remainder of Gateway. Generic routing, transport sequencing, replay/resume and Gateway runtime remain IA-07 territory. The device-auth boundary must be explicit so one agent does not silently absorb the other's responsibilities.

## IA-08 interface

Device status, enrollment state and diagnostics may be exposed to UI, but private key material must remain in the privileged Desktop boundary. UI requirements are consumers of the device-auth contract, not authorities over it.

## Dependency conclusion

IA-06 is not independently implementable end-to-end. The minimum cross-agent readiness chain is **IA-01 persistence → IA-02 conventions → IA-03 durable/audit semantics → IA-07 transport boundary → IA-08 UI integration**, with Windows Secure Storage as an external validation gate.
