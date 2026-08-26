# KassisT — Governance Chronology v1.0

**Status:** CANONICAL / ACTIVE  
**Governance timezone:** `America/Sao_Paulo`  
**Purpose:** normalize governance dates independently of GitHub's UTC commit timestamps.

## Rule

Governance decisions are dated using the project operating timezone `America/Sao_Paulo`.

GitHub commit timestamps are stored in UTC and MUST NOT be interpreted as governance dates without timezone conversion.

## Current reconciliation

The commits used to record D-008 and the surrounding governance patch are timestamped in GitHub on `2026-08-26T01:xx:xxZ`. In `America/Sao_Paulo` these timestamps fall on **2026-08-25** during the late evening.

Therefore:

- D-008 is a **2026-08-25** governance event for project chronology.
- D-009 is a **2026-08-25** governance event.
- The governance patch that follows these decisions is also part of the 2026-08-25 operational sequence.

## Non-retroactivity rule

A decision must not be used as authority for an action that occurred before the decision's effective local timestamp.

Historical task evidence must distinguish:

- event timestamp in UTC;
- normalized governance date/time in `America/Sao_Paulo`;
- baseline SHA at the time of the event.

## Canonical precedence

When a document heading or generated date appears inconsistent with the actual event timestamp, this chronology document and the normalized timestamp are authoritative for governance sequencing.

The Decision Log remains the normative record of the decision itself; this document resolves only timestamp normalization and chronology.
