import assert from "node:assert/strict";
import { mkdtemp, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import Database from "better-sqlite3";
import { discoverMigrations } from "./migrations.js";
import { applyMigrations, readAppliedMigrations } from "./migration-runner.js";
import { SQLiteDatabase } from "./sqlite-database.js";

test("migration discovery is deterministic and checksumed", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-migrations-"));
  await writeFile(path.join(directory, "0002_second.sql"), "CREATE TABLE second(id INTEGER);\n");
  await writeFile(path.join(directory, "0001_first.sql"), "CREATE TABLE first(id INTEGER);\n");

  const migrations = await discoverMigrations(directory);
  assert.deepEqual(migrations.map((migration) => migration.id), ["0001_first", "0002_second"]);
  assert.equal(migrations.every((migration) => migration.checksum.length === 64), true);
});

test("migration application is idempotent and rejects checksum drift", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-migrations-"));
  await writeFile(path.join(directory, "0001_first.sql"), "CREATE TABLE first(id INTEGER);\n");
  const migrations = await discoverMigrations(directory);
  const database = new Database(":memory:");

  try {
    applyMigrations(database, migrations, { applicationVersion: "0.1.0" });
    const appliedOnce = readAppliedMigrations(database);
    applyMigrations(database, migrations, { applicationVersion: "0.1.0" });
    assert.deepEqual(readAppliedMigrations(database), appliedOnce);

    await writeFile(path.join(directory, "0001_first.sql"), "CREATE TABLE first(id INTEGER, extra TEXT);\n");
    const changed = await discoverMigrations(directory);
    assert.throws(
      () => applyMigrations(database, changed, { applicationVersion: "0.1.0" }),
      /checksum mismatch/
    );
  } finally {
    database.close();
  }
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
    assert.equal(database.appliedMigrations().length, 1);

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
