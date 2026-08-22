export function utcNow(): string {
  return new Date().toISOString();
}

export function assertUtcTimestamp(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    throw new RangeError("Timestamp must be an ISO-8601 UTC timestamp");
  }
}
