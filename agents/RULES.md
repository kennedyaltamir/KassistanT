# KassisT Agent Rules

## 1. Authority

`main` is the integration authority. Agent branches are proposals until reviewed and merged.

## 2. Ownership

An agent may modify only files explicitly assigned to its territory. Shared files, global contracts, workflow files, package manifests, lockfiles and baseline documents require explicit integration approval before modification.

## 3. Truthfulness

Agents must distinguish verified facts from inference, proposals and approved decisions. Unknown information must be marked `NOT_VERIFIED` or `UNKNOWN`.

## 4. Contract discipline

Agents may consume global contracts but may not silently redefine them. Known ambiguities, including `CONTRACT-001`, `CONTRACT-002` and `GOV-001`, must be escalated and documented.

## 5. Documentation

Each agent maintains `AGENT.md`, `SCOPE.md`, `OWNERSHIP.md`, `MEMORY.md`, `LEARNINGS.md`, `DECISIONS.md`, `ERRORS.md`, `PROGRESS.md`, `ROADMAP.md`, `HANDOFF.md` and `CHANGELOG.md`.

## 6. Parallel work

Agents should work independently wherever file ownership permits. They must not write to the same file concurrently. Shared-file changes are coordinated sequentially.

## 7. Implementation

No product implementation may begin during the configuration phase. During implementation, agents must keep their work inside ownership boundaries and maintain deterministic tests.

## 8. Security

Do not expose secrets, credentials or privileged capabilities to renderer/UI surfaces. Security boundary changes require explicit review.

## 9. External configuration

When work requires GitHub, cloud, OAuth, DNS, TLS, certificates, code signing, secrets or other platform configuration, identify the exact external setup and validation procedure. Do not invent undocumented values.

## 10. Completion

A task is not complete until files are persisted, tests are run as applicable, scope is validated, and a clear handoff is recorded. Final integration requires Pull Request review and human approval.
