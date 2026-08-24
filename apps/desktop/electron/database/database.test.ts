import assert from "node:assert/strict";
import { mkdtemp, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import Database from "better-sqlite3";
import { authoritativeMigrations, MIGRATION_HISTORICAL_NON_AUTHORITATIVE } from "./migration-policy.js";
import { discoverMigrations } from "./migrations.js";
import { applyMigrations, isHistoricalNonAuthoritative, readAppliedMigrations } from "./migration-runner.js";
import { SQLiteDatabase } from "./sqlite-database.js";

test("migration discovery is deterministic, checksumed and classifies historical artifacts", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-migrations-"));
  await writeFile(path.join(directory, "0002_second.sql"), "CREATE TABLE second(id INTEGER);\n");
  await writeFile(path.join(directory, "0001_first.sql"), "CREATE TABLE first(id INTEGER);\n");

  const migrations = await discoverMigrations(directory);
  assert.deepEqual(migrations.map((migration) => migration.id), ["0001_first", "0002_second"]);
  assert.equal(migrations.every((migration) => migration.checksum.length === 64), true);
  assert.equal(migrations[0]?.authority, "UNCLASSIFIED");
  assert.equal(migrations[1]?.authority, "UNCLASSIFIED");
});

test("historical 0002 remains discoverable but is not selected for execution", async () => {
  const migrationsPath = path.resolve("database", "migrations");
  const migrations = await discoverMigrations(migrationsPath);
  const historical = migrations.find((migration) => migration.id === "0002_c1_product_order");

  assert.ok(historical);
  assert.equal(isHistoricalNonAuthoritative(historical), true);
  assert.equal(historical.authority, MIGRATION_HISTORICAL_NON_AUTHORITATIVE);
  assert.deepEqual(authoritativeMigrations(migrations).map((migration) => migration.id), ["0001_bootstrap"]);
});

test("unclassified migrations fail closed and cannot execute", async () => {
  const database = new Database(":memory:");
  const migrations = [
    {
      id: "0001_bootstrap",
      fileName: "0001_bootstrap.sql",
      filePath: "0001_bootstrap.sql",
      sql: "CREATE TABLE first(id INTEGER);",
      checksum: "a".repeat(64),
      authority: "AUTHORITATIVE" as const
    },
    {
      id: "0003_future",
      fileName: "0003_future.sql",
      filePath: "0003_future.sql",
      sql: "CREATE TABLE must_not_execute(id INTEGER);",
      checksum: "b".repeat(64),
      authority: "UNCLASSIFIED" as const
    }
  ];

  try {
    assert.throws(
      () => applyMigrations(database, migrations, { applicationVersion: "0.1.0" }),
      /Unclassified migration\(s\) cannot execute: 0003_future/
    );
    assert.equal(
      database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'must_not_execute'").get(),
      undefined
    );
  } finally {
    database.close();
  }
});

test("migration application is idempotent and rejects checksum drift", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-migrations-"));
  await writeFile(path.join(directory, "0001_first.sql"), "CREATE TABLE first(id INTEGER);\n");
  const migrations = (await discoverMigrations(directory)).map((migration) => ({
    ...migration,
    authority: "AUTHORITATIVE" as const
  }));
  const database = new Database(":memory:");

  try {
    applyMigrations(database, migrations, { applicationVersion: "0.1.0" });
    const appliedOnce = readAppliedMigrations(database);
    applyMigrations(database, migrations, { applicationVersion: "0.1.0" });
    assert.deepEqual(readAppliedMigrations(database), appliedOnce);

    await writeFile(path.join(directory, "0001_first.sql"), "CREATE TABLE first(id INTEGER, extra TEXT);\n");
    const changed = (await discoverMigrations(directory)).map((migration) => ({
      ...migration,
      authority: "AUTHORITATIVE" as const
    }));
    assert.throws(
      () => applyMigrations(database, changed, { applicationVersion: "0.1.0" }),
      /checksum mismatch/
    );
  } finally {
    database.close();
  }
});

test("fresh SQLite database applies authoritative 0001 only and restart remains idempotent", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-db-"));
  const databasePath = path.join(directory, "kassist.sqlite");
  const migrationsPath = path.resolve("database", "migrations");

  const database = await SQLiteDatabase.open({
    filePath: databasePath,
    migrationsPath,
    applicationVersion: "0.1.0"
  });

  try {
    assert.equal(database.healthCheck().ok, true);
    assert.deepEqual(
      database.appliedMigrations().map((migration) => migration.migration_id),
      ["0001_bootstrap"]
    );
    assert.equal(database.healthCheck().schemaVersion, "0001");
    assert.equal(
      database.query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'product'"
      ).length,
      0
    );
  } finally {
    database.close();
  }

  const restarted = await SQLiteDatabase.open({
    filePath: databasePath,
    migrationsPath,
    applicationVersion: "0.1.0"
  });

  try {
    assert.deepEqual(
      restarted.appliedMigrations().map((migration) => migration.migration_id),
      ["0001_bootstrap"]
    );
  } finally {
    restarted.close();
  }

  assert.equal((await stat(databasePath)).isFile(), true);
});

test("SQLite transaction boundary rolls back on failure", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-db-"));
  const databasePath = path.join(directory, "kassist.sqlite");
  const migrationsPath = path.resolve("database", "migrations");
  const database = await SQLiteDatabase.open({
    filePath: databasePath,
    migrationsPath,
    applicationVersion: "0.1.0"
  });

  try {
    assert.equal(database.healthCheck().ok, true);

    assert.throws(() => {
      database.transaction(() => {
        database.execute("CREATE TABLE tx_test(id INTEGER PRIMARY KEY)");
        database.execute("INSERT INTO tx_test(id) VALUES (?)", 1);
        throw new Error("force rollback");
      });
    }, /SQLite transaction failed/);

    assert.equal(
      database.query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tx_test'"
      ).length,
      0
    );
  } finally {
    database.close();
  }

  assert.equal((await stat(databasePath)).isFile(), true);
});
