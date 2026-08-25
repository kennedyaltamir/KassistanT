import Database = require("better-sqlite3");
import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { DatabaseError } from "./errors.js";
import { applyMigrations, readAppliedMigrations } from "./migration-runner.js";
import { discoverMigrations } from "./migrations.js";

export interface SQLiteDatabaseOptions {
  filePath: string;
  migrationsPath: string;
  applicationVersion: string;
}

export interface DatabaseHealth {
  ok: boolean;
  schemaVersion: string;
  integrity: "ok" | "failed";
}

export interface SQLiteRunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

export function getDefaultDatabasePath(): string {
  const base = process.env.APPDATA ?? process.env.XDG_DATA_HOME ?? path.join(os.homedir(), ".config");
  return path.join(base, "KassisT", "database", "kassist.sqlite");
}

export class SQLiteDatabase {
  private constructor(private readonly connection: Database.Database) {}

  static async open(options: SQLiteDatabaseOptions): Promise<SQLiteDatabase> {
    try {
      await mkdir(path.dirname(options.filePath), { recursive: true });
      const connection = new Database(options.filePath);
      connection.pragma("foreign_keys = ON");
      connection.pragma("journal_mode = WAL");
      connection.pragma("busy_timeout = 5000");

      const database = new SQLiteDatabase(connection);
      const migrations = await discoverMigrations(options.migrationsPath);
      applyMigrations(connection, migrations, {
        applicationVersion: options.applicationVersion
      });
      return database;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("DATABASE_OPEN_FAILED", "Failed to open SQLite database", error);
    }
  }

  transaction<T>(work: () => T): T {
    try {
      return this.connection.transaction(work)();
    } catch (error) {
      throw new DatabaseError("DATABASE_TRANSACTION_FAILED", "SQLite transaction failed", error);
    }
  }

  execute(sql: string, ...parameters: unknown[]): SQLiteRunResult {
    try {
      const result = this.connection.prepare(sql).run(...parameters);
      return {
        changes: Number(result.changes),
        lastInsertRowid: result.lastInsertRowid
      };
    } catch (error) {
      throw new DatabaseError("DATABASE_QUERY_FAILED", "SQLite statement failed", error);
    }
  }

  query<T>(sql: string, ...parameters: unknown[]): T[] {
    try {
      return this.connection.prepare(sql).all(...parameters) as T[];
    } catch (error) {
      throw new DatabaseError("DATABASE_QUERY_FAILED", "SQLite query failed", error);
    }
  }

  appliedMigrations() {
    return readAppliedMigrations(this.connection);
  }

  healthCheck(): DatabaseHealth {
    try {
      const result = this.connection.prepare("SELECT 1 AS ok").get() as { ok: number } | undefined;
      const schemaVersion = this.connection
        .prepare("SELECT value FROM _schema_metadata WHERE key = 'schema_version'")
        .get() as { value: string } | undefined;
      const integrity = this.connection.prepare("PRAGMA quick_check").pluck().get() as string;

      return {
        ok: result?.ok === 1 && integrity === "ok",
        schemaVersion: schemaVersion?.value ?? "unknown",
        integrity: integrity === "ok" ? "ok" : "failed"
      };
    } catch (error) {
      throw new DatabaseError("DATABASE_HEALTH_FAILED", "SQLite health check failed", error);
    }
  }

  close(): void {
    this.connection.close();
  }
}
