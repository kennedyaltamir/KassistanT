# Inbox / Outbox

Status: DEFINED / AMBIGUOUS.

InboundInbox is durable before processing; ACK follows successful commit. DomainOutbox is created in the domain transaction and drives external effects. Ownership/scope across local Core and Gateway remains CONTRACT-001.