export type DatabaseErrorCode =
  | "DATABASE_OPEN_FAILED"
  | "DATABASE_QUERY_FAILED"
  | "DATABASE_TRANSACTION_FAILED"
  | "DATABASE_HEALTH_FAILED"
  | "MIGRATION_FAILED"
  | "MIGRATION_CHECKSUM_MISMATCH";

export class DatabaseError extends Error {
  public readonly code: DatabaseErrorCode;

  constructor(code: DatabaseErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
    if (cause !== undefined) this.cause = cause;
  }
}

export class MigrationError extends DatabaseError {
  readonly migrationId: string;

  constructor(migrationId: string, cause: unknown) {
    super("MIGRATION_FAILED", `Migration failed: ${migrationId}`, cause);
    this.name = "MigrationError";
    this.migrationId = migrationId;
  }
}

export class MigrationChecksumMismatchError extends DatabaseError {
  readonly migrationId: string;
  readonly expectedChecksum: string;
  readonly actualChecksum: string;

  constructor(migrationId: string, expectedChecksum: string, actualChecksum: string) {
    super("MIGRATION_CHECKSUM_MISMATCH", `Migration checksum mismatch: ${migrationId}`);
    this.name = "MigrationChecksumMismatchError";
    this.migrationId = migrationId;
    this.expectedChecksum = expectedChecksum;
    this.actualChecksum = actualChecksum;
  }
}
