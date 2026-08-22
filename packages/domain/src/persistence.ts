export interface TransactionBoundary {
  transaction<T>(work: () => T): T;
}
