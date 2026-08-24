# Persistence

Status: DEFINED / PARTIAL.

InboundInbox persists external events before processing. DomainOutbox persists external effects within transaction semantics. Ownership and scope across local Core and Gateway remain AMBIGUOUS under CONTRACT-001.