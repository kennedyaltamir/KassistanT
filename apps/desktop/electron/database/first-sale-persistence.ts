import type { SQLiteDatabase } from "./sqlite-database.js";

export interface CustomerRecord {
  readonly id: string;
  readonly store_id: string;
  readonly phone_normalized: string;
  readonly name?: string | null;
}

export interface ConversationRecord {
  readonly id: string;
  readonly store_id: string;
  readonly customer_id: string;
  readonly external_thread_id: string;
}

export interface MessageRecord {
  readonly id: string;
  readonly store_id: string;
  readonly conversation_id: string;
  readonly external_message_id: string;
  readonly direction: "INBOUND" | "OUTBOUND";
  readonly sender_type: string;
  readonly message_type: string;
  readonly text?: string | null;
  readonly correlation_id?: string | null;
  readonly causation_id?: string | null;
}

export interface DomainOutboxRecord {
  readonly id: string;
  readonly idempotency_key: string;
  readonly event_type: string;
  readonly aggregate_id: string;
  readonly payload: string;
  readonly occurred_at_utc: string;
}

export class SQLiteCustomerRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  findByPhone(storeId: string, phoneNormalized: string): CustomerRecord | null {
    const row = this.database.query<CustomerRecord>(
      `SELECT id, store_id, phone_normalized, name
       FROM customer WHERE store_id = ? AND phone_normalized = ?`,
      storeId,
      phoneNormalized
    )[0];
    return row ?? null;
  }

  create(customer: CustomerRecord): void {
    const now = new Date().toISOString();
    this.database.execute(
      `INSERT INTO customer (
         id, store_id, phone_normalized, name, notes, first_order_at, last_order_at,
         order_count, total_spent_cents, currency, status, created_at, updated_at
       ) VALUES (?, ?, ?, ?, NULL, NULL, NULL, 0, 0, 'BRL', 'ACTIVE', ?, ?)`,
      customer.id,
      customer.store_id,
      customer.phone_normalized,
      customer.name ?? null,
      now,
      now
    );
  }
}

export class SQLiteConversationRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  findByExternalThread(storeId: string, externalThreadId: string): ConversationRecord | null {
    const row = this.database.query<ConversationRecord>(
      `SELECT id, store_id, customer_id, external_thread_id
       FROM conversation WHERE store_id = ? AND external_thread_id = ?`,
      storeId,
      externalThreadId
    )[0];
    return row ?? null;
  }

  create(conversation: ConversationRecord): void {
    const now = new Date().toISOString();
    this.database.execute(
      `INSERT INTO conversation (
         id, store_id, customer_id, external_thread_id, lifecycle_state,
         ownership, ai_state, unread_count, created_at, updated_at
       ) VALUES (?, ?, ?, ?, 'OPEN', 'AI', 'ACTIVE', 0, ?, ?)`,
      conversation.id,
      conversation.store_id,
      conversation.customer_id,
      conversation.external_thread_id,
      now,
      now
    );
  }
}

export class SQLiteMessageRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  insertInbound(message: MessageRecord): boolean {
    const now = new Date().toISOString();
    const result = this.database.execute(
      `INSERT OR IGNORE INTO message (
         id, store_id, conversation_id, external_message_id, direction,
         sender_type, message_type, text, raw_event_reference, lifecycle_state,
         correlation_id, causation_id, created_at, updated_at
       ) VALUES (?, ?, ?, ?, 'INBOUND', ?, ?, ?, NULL, 'RECEIVED', ?, ?, ?, ?)`,
      message.id,
      message.store_id,
      message.conversation_id,
      message.external_message_id,
      message.sender_type,
      message.message_type,
      message.text ?? null,
      message.correlation_id ?? null,
      message.causation_id ?? null,
      now,
      now
    );
    return result.changes === 1;
  }
}

export class SQLiteDomainOutboxRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  append(event: DomainOutboxRecord): boolean {
    const result = this.database.execute(
      `INSERT OR IGNORE INTO domain_outbox (
         id, idempotency_key, event_type, aggregate_id, payload,
         occurred_at_utc, attempts, processed_at, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?)`,
      event.id,
      event.idempotency_key,
      event.event_type,
      event.aggregate_id,
      event.payload,
      event.occurred_at_utc,
      new Date().toISOString()
    );
    return result.changes === 1;
  }
}
