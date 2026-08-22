# Security Policy

## Secrets

Never commit API tokens, OAuth refresh tokens, client secrets, private keys, passwords or other credentials.

Desktop runtime secrets belong in Windows Secure Storage when applicable. Gateway secrets belong in the Gateway secret-management boundary.

## Electron

Required security posture includes `contextIsolation=true`, `nodeIntegration=false`, restrictive CSP, IPC sender validation, navigation/new-window controls, permission handlers, `shell.openExternal` allowlisting and Electron Fuses.

## Data protection

Customer data, conversations and orders are business data and must not be exposed through logs or diagnostics without explicit policy.

## Vulnerability reporting

Do not publish exploit details containing active secrets or customer data. Use the repository's private security reporting process when enabled.
