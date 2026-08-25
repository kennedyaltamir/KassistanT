import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export interface MigrationDefinition {
  id: string;
  fileName: string;
  filePath: string;
  sql: string;
  checksum: string;
}

const MIGRATION_PATTERN = /^(\d{4}_[a-z0-9][a-z0-9_-]*)\.sql$/i;

const HISTORICAL_NON_AUTHORITATIVE = new Set([
  "0002_c1_product_order",
  // 0003_first_sale_core already creates conversation.external_thread_id.
  // 0005 is retained only for the legacy runtime migration path that repairs
  // databases created before the canonical 0003 schema.
  "0005_add_conversation_external_thread_id"
]);

const AUTHORITATIVE_MIGRATIONS = new Set([
  "0001_bootstrap",
  "0003_first_sale_core",
  "0004_first_sale_order_modifiers"
]);

export async function discoverMigrations(directory: string): Promise<MigrationDefinition[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && MIGRATION_PATTERN.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));

  const migrations: MigrationDefinition[] = [];
  for (const entry of files) {
    const match = entry.name.match(MIGRATION_PATTERN);
    if (!match) continue;

    const migrationId = match[1];
    if (!migrationId) {
      throw new Error(`Invalid migration filename: ${entry.name}`);
    }

    if (HISTORICAL_NON_AUTHORITATIVE.has(migrationId)) continue;

    if (!AUTHORITATIVE_MIGRATIONS.has(migrationId)) {
      throw new Error(
        `Unauthorized migration discovered: ${migrationId}. ` +
          "Add it to the authoritative migration allowlist only after explicit approval."
      );
    }

    const filePath = path.join(directory, entry.name);
    const content = await readFile(filePath);

    migrations.push({
      id: migrationId,
      fileName: entry.name,
      filePath,
      sql: content.toString("utf8"),
      checksum: createHash("sha256").update(content).digest("hex")
    });
  }

  return migrations;
}
