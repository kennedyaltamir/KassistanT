export const MIGRATION_AUTHORITATIVE = "AUTHORITATIVE" as const;
export const MIGRATION_HISTORICAL_NON_AUTHORITATIVE = "HISTORICAL_NON_AUTHORITATIVE" as const;
export const MIGRATION_UNCLASSIFIED = "UNCLASSIFIED" as const;

export type MigrationAuthority =
  | typeof MIGRATION_AUTHORITATIVE
  | typeof MIGRATION_HISTORICAL_NON_AUTHORITATIVE
  | typeof MIGRATION_UNCLASSIFIED;

/**
 * Explicit migration classification. Filename discovery remains broad so
 * historical artifacts stay visible, while execution is fail-closed.
 */
const MIGRATION_AUTHORITY: Readonly<Record<string, Exclude<MigrationAuthority, typeof MIGRATION_UNCLASSIFIED>>> = {
  "0001_bootstrap": MIGRATION_AUTHORITATIVE,
  "0002_c1_product_order": MIGRATION_HISTORICAL_NON_AUTHORITATIVE
};

export function classifyMigration(migrationId: string): MigrationAuthority {
  return MIGRATION_AUTHORITY[migrationId] ?? MIGRATION_UNCLASSIFIED;
}

export function authoritativeMigrations<T extends { id: string; authority: MigrationAuthority }>(
  migrations: readonly T[]
): T[] {
  const unclassified = migrations.filter(
    (migration) => migration.authority === MIGRATION_UNCLASSIFIED
  );
  if (unclassified.length > 0) {
    throw new Error(
      `Unclassified migration(s) cannot execute: ${unclassified.map((migration) => migration.id).join(", ")}`
    );
  }

  return migrations.filter(
    (migration) => migration.authority === MIGRATION_AUTHORITATIVE
  );
}
