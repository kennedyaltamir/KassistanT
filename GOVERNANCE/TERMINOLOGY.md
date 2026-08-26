# KassisT — Canonical Terminology v1.0

**Status:** CANONICAL / ACTIVE  
**Decision:** D-006  

## 1. Conversation experience

`Conversas` is the user-facing navigation label for the conversation experience in the Desktop UI.

## 2. Conversation domain

`Conversation` is the provider-neutral domain concept representing a conversation context.

`Message` is the provider-neutral domain concept representing a message within a conversation.

`Contact` is the provider-neutral representation of a person/contact identity as defined by the product domain.

## 3. Channel/provider

`WhatsApp` is a concrete messaging channel/provider integration.

Provider-specific behavior, identifiers and transport details must remain behind the channel/integration boundary and must not redefine the generic conversation domain.

## 4. Naming rules

- UI navigation may use `Conversas`.
- Domain models should prefer `Conversation`, `Message`, `Contact`, `Channel` and related provider-neutral concepts.
- Integration code may explicitly reference `WhatsApp` where provider behavior is relevant.
- New domain entities must not be named `WhatsAppConversation` or equivalent solely because the current first provider is WhatsApp, unless there is a verified domain reason.
- Documentation should distinguish user-facing terminology from domain terminology and transport/provider terminology.

## 5. Future channels

Adding another provider must not require renaming the generic conversation domain. A provider adapter should map provider-specific events/messages into the canonical domain model.

## 6. Governance

D-006 is recorded in `ROADMAP/07_DECISION_LOG.md`. Changes to this terminology that affect contracts, domain models or canonical UI vocabulary require an explicit decision and evidence.
