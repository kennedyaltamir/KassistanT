# Device Enrollment Protocol

Endpoints:

- `POST /v1/devices/enrollment/start`
- `POST /v1/devices/enrollment/complete`
- `POST /v1/devices/enrollment/cancel`

Enrollment produces an enrollment id, device id, pairing code and expiry. Completion associates the Store, Device and Ed25519 public key. Private key remains in Windows Secure Storage.

Authentication after enrollment is challenge-response over WSS. Shared-secret HMAC is not the normative model.
