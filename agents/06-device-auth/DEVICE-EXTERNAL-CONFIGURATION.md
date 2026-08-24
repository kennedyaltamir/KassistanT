# IA-06 — External Configuration Register

No external configuration is executed by IA-06 in contract-closure phase.

## Secure Storage boundary

| Layer | Status | Meaning |
|---|---|---|
| Logical security requirement | DEFINED | Private key remains under privileged Desktop control and is not exposed to Renderer/UI or logs. |
| Technology selection | OPEN / EXTERNAL | Concrete Windows secure-storage mechanism is not selected by IA-06. |
| Runtime validation | EXTERNAL_CONFIGURATION_REQUIRED | Supported Windows runtime must validate key generation/access/signing/deletion/replacement behavior without exposing key material. |
| Key lifecycle validation | EXTERNAL + CONTRACT | Rotation/recovery/deletion semantics require both contract closure and runtime validation; no local lifecycle is invented. |

## Other external dependencies

| Dependency | Platform | Boundary | Status | Owner |
|---|---|---|---|---|
| Gateway TLS/DNS/certificates | Gateway hosting/provider | Public transport configuration | EXTERNAL_CONFIGURATION_REQUIRED | IA-07 / operations |
| CI/CD signing or secrets | GitHub / release infrastructure | Repository/release configuration | NON_BLOCKING for contract closure | Release/operations |

## IA-06 rule

External validation must not be confused with architectural approval. The project may approve the logical Secure Storage requirement before selecting a concrete Windows implementation.

No secret value, certificate private key or credential is recorded in this document.
