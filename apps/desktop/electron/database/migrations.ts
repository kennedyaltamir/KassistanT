import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { classifyMigration } from "./migration-policy.js";

export interface MigrationDefinition {
  id: string;
  fileName: string;
  filePath: string;
  sql: string;
  checksum: string;
  authority: ReturnType<typeof classifyMigration>;
}

const MIGRATION_PATTERN = /^(\d{4}_[a-z0-9][a-z0-9_-]*)\.sql$/i;

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

    const filePath = path.join(directory, entry.name);
    const content = await readFile(filePath);

    migrations.push({
      id: migrationId,
      fileName: entry.name,
      filePath,
      sql: content.toString("utf8"),
      checksum: createHash("sha256").update(content).digest("hex"),
      authority: classifyMigration(migrationId)
    });
  }

  return migrations;
}
