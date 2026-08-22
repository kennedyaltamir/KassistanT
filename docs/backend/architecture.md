# Backend Architecture

Status: DEFINED / CURRENT bootstrap.

Desktop Core owns deterministic business rules and SQLite persistence. Gateway is a public transport/integration boundary and does not execute pricing, order, stock or conversational rules. Reliability boundaries are InboundInbox, DomainOutbox, JobQueue, EventBus and AuditLog. Event Sourcing/Event Store are not used in MVP.
