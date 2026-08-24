# Google Provider Contract

Provider: `GoogleContactsSyncAdapter`.
Status: PARTIAL / EXTERNAL.

KassisT is the operational source of truth; Google Contacts is a synchronized projection. OAuth/PKCE is used and refresh tokens belong in Windows Secure Storage. Sync is asynchronous and must not block sales. Conflicts require detection and audit rather than silent overwrite.

Current Google verification, scopes and external limits are EXTERNAL.