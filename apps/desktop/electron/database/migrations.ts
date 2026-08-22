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

export async function discoverMigrations(directory: string): Promise<MigrationDefinition[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && MIGRATION_PATTERN.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));

  const migrations: MigrationDefinition[] = [];
  for (const entry of files) {
    const match = entry.name.match(MIGRATION_PATTERN);
    if (!match) continue;

    const filePath = path.join(directory, entry.name);
    const content = await readFile(filePath);

    migrations.push({
      id: match[1],
      fileName: entry.name,
      filePath,
      sql: content.toString("utf8"),
      checksum: createHash("sha256").update(content).digest("hex")
    });
  }

  return migrations;
}
