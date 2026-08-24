# IA-06 — External Configuration Register

No external configuration is executed by IA-06 in contract-closure phase.

| Dependency | Platform | Configuration | Status | Validation |
|---|---|---|---|---|
| Private-key storage | Supported Windows runtime | Concrete secure-storage mechanism | EXTERNAL_CONFIGURATION_REQUIRED | Must be tested on supported Windows versions without exposing key to Renderer/logs. |
| Gateway TLS/DNS/certificates | Gateway hosting/provider | Public transport configuration | EXTERNAL_CONFIGURATION_REQUIRED | Owned operationally outside IA-06; IA-07 owns transport boundary. |
| CI/CD signing or secrets | GitHub / release infrastructure | Repository secret/configuration values | NON_BLOCKING for contract closure | No secret values are recorded here. |

## IA-06 rule

The logical contract is normative: private key is privileged, never exposed to Renderer, never logged, and signing authority remains inside privileged Desktop runtime. Concrete Windows technology remains an implementation/external-validation decision.
