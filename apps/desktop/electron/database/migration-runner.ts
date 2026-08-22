import Database = require("better-sqlite3");
import { MigrationChecksumMismatchError, MigrationError } from "./errors.js";
import type { MigrationDefinition } from "./migrations.js";

export interface MigrationMetadata {
  migration_id: string;
  checksum: string;
  applied_at: string;
  application_version: string;
}

export interface MigrationRunnerOptions {
  applicationVersion: string;
  now?: () => string;
}

export function ensureMigrationMetadataTable(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      migration_id TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TEXT NOT NULL,
      application_version TEXT NOT NULL
    );
  `);
}

export function readAppliedMigrations(database: Database.Database): MigrationMetadata[] {
  return database
    .prepare(
      `SELECT migration_id, checksum, applied_at, application_version
       FROM _schema_migrations
       ORDER BY migration_id`
    )
    .all() as MigrationMetadata[];
}

export function applyMigrations(
  database: Database.Database,
  migrations: readonly MigrationDefinition[],
  options: MigrationRunnerOptions
): MigrationMetadata[] {
  ensureMigrationMetadataTable(database);

  const applied = new Map(
    readAppliedMigrations(database).map((migration) => [migration.migration_id, migration])
  );
  const now = options.now ?? (() => new Date().toISOString());

  for (const migration of migrations) {
    const existing = applied.get(migration.id);
    if (existing) {
      if (existing.checksum !== migration.checksum) {
        throw new MigrationChecksumMismatchError(
          migration.id,
          existing.checksum,
          migration.checksum
        );
      }
      continue;
    }

    const appliedAt = now();
    try {
      database
        .transaction(() => {
          database.exec(migration.sql);
          database
            .prepare(
              `INSERT INTO _schema_migrations(
                migration_id, checksum, applied_at, application_version
              ) VALUES (?, ?, ?, ?)`
            )
            .run(migration.id, migration.checksum, appliedAt, options.applicationVersion);
        })();
    } catch (error) {
      throw new MigrationError(migration.id, error);
    }

    applied.set(migration.id, {
      migration_id: migration.id,
      checksum: migration.checksum,
      applied_at: appliedAt,
      application_version: options.applicationVersion
    });
  }

  return readAppliedMigrations(database);
}
