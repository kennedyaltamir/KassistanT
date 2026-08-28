import assert from "node:assert/strict";
import { mkdtemp, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import Database from "better-sqlite3";
import { discoverMigrations } from "./migrations.js";
import { applyMigrations, readAppliedMigrations } from "./migration-runner.js";
import { SQLiteDatabase } from "./sqlite-database.js";

test("migration discovery excludes historical 0002 and fails closed on unknown future migrations", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-migrations-"));
  await writeFile(path.join(directory, "0001_bootstrap.sql"), "CREATE TABLE first(id INTEGER);\n");
  await writeFile(path.join(directory, "0002_c1_product_order.sql"), "CREATE TABLE historical(id INTEGER);\n");
  await writeFile(path.join(directory, "0003_first_sale_core.sql"), "CREATE TABLE core(id INTEGER);\n");

  const migrations = await discoverMigrations(directory);
  assert.deepEqual(migrations.map((migration) => migration.id), ["0001_bootstrap", "0003_first_sale_core"]);
  assert.equal(migrations.every((migration) => migration.checksum.length === 64), true);

  await writeFile(path.join(directory, "0009_future.sql"), "CREATE TABLE future(id INTEGER);\n");
  await assert.rejects(() => discoverMigrations(directory), /Unauthorized migration discovered/);
});

test("migration application is idempotent and rejects checksum drift", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-migrations-"));
  await writeFile(path.join(directory, "0001_bootstrap.sql"), "CREATE TABLE first(id INTEGER);\n");
  const migrations = await discoverMigrations(directory);
  const database = new Database(":memory:");

  try {
    applyMigrations(database, migrations, { applicationVersion: "0.1.0" });
    const appliedOnce = readAppliedMigrations(database);
    applyMigrations(database, migrations, { applicationVersion: "0.1.0" });
    assert.deepEqual(readAppliedMigrations(database), appliedOnce);

    await writeFile(path.join(directory, "0001_bootstrap.sql"), "CREATE TABLE first(id INTEGER, extra TEXT);\n");
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
    const appliedIds = database.appliedMigrations().map((migration) => migration.migration_id);
    assert.deepEqual(appliedIds, [
      "0001_bootstrap",
      "0003_first_sale_core",
      "0004_first_sale_order_modifiers",
      "0005_assistant_product_fields"
    ]);
    assert.equal(database.healthCheck().schemaVersion, "0005");

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
