# Migrations

Status: DEFINED / PARTIAL.

Migrations are versioned and should carry migration id, checksum, applied timestamp and application version. Backup precedes potentially destructive migrations. Irreversible downgrade requires restore unless explicitly reversible. Current implementation has only bootstrap metadata.