# Domain State Machines

Status: DEFINED / PARTIAL.

ConversationLifecycle: OPEN, CLOSED. ConversationOwnership: AI, HUMAN. AIState: ACTIVE, PAUSED, UNAVAILABLE. MessageLifecycle: RECEIVED, QUEUED, PROCESSING, SENT, DELIVERED, READ, FAILED, REJECTED. OrderLifecycle: DRAFT, CONFIRMED, IN_PRODUCTION, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED.

CONFIRMED is the operational sale milestone. Invalid transitions are rejected. Actor permission details remain PARTIAL.