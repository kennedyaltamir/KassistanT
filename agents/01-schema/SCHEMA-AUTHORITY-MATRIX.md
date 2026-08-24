# IA-01 — Schema Authority Matrix

This matrix identifies who owns semantic decisions and who owns their physical SQLite realization.

| Schema Decision | Authority | IA-01 Role | Related Agents | Approval Character |
|---|---|---|---|---|
| Canonical table/column physical naming | IA-01 for local schema; global only if promoted to repository convention | Propose and materialize | All consumers | Local decision, operator review |
| UUID logical semantics | Global baseline | Consume | IA-02, IA-03, IA-04, IA-05, IA-06, IA-07 | Already approved |
| UUID SQLite representation | IA-01 | Materialize physical form | All ID consumers | Local implementation decision |
| UTC logical semantics | Global baseline | Consume | All | Already approved |
| UTC SQLite representation | IA-01 | Materialize physical form | All timestamp consumers | Local implementation decision |
| Money cents/BRL | Global baseline/domain | Consume and enforce physical representation | IA-02, IA-04, IA-05 | Already approved |
| Domain entity meaning | IA-02 | Map, do not redefine | IA-04, IA-05, IA-06 | Cross-agent |
| Order semantics | IA-04 + IA-02 | Persist approved contract | IA-01, IA-03 | Cross-agent |
| OrderItem parent key | IA-04 | Persist approved relationship | IA-02, IA-03 | Cross-agent |
| OrderItemModifier parent keys | IA-04 | Persist approved relationship | IA-02 | Cross-agent |
| OrderStatusHistory semantics | IA-04 + IA-02 | Persist approved history model | IA-03 | Cross-agent |
| Conversation lifecycle/ownership/AI state | IA-02 + IA-05 | Persist approved state catalog | IA-03, IA-08 | Cross-agent |
| Message lifecycle/direction/type | IA-05 + IA-02 | Persist approved message contract | IA-03, IA-07 | Cross-agent |
| Device identity/status fields | IA-06 + IA-02 where domain semantics apply | Persist approved identity model | IA-07 | Cross-agent/security |
| DomainOutbox ownership/scope | Global project authority | Must not resolve | IA-03, IA-07 | Global decision |
| InboundInbox reliability semantics | IA-03 | Persist approved infrastructure contract | IA-07 | Cross-agent |
| Job persistence semantics | IA-03 | Persist approved job contract | IA-05, IA-07 | Cross-agent |
| AuditLog semantic event scope | IA-03 + domain owners | Persist approved audit model | IA-02, IA-04, IA-05, IA-06 | Cross-agent |
| Integration identity/status | IA-02 with provider owners | Persist approved model | IA-05, IA-06, IA-07 | Cross-agent |
| IntegrationCredential security boundary | IA-06 for secure storage boundary; provider owner for provider-specific references | Persist references only | IA-05, IA-07 | Cross-agent/security |
| KnowledgeItem semantics | IA-02 + IA-05 | Persist approved knowledge model | IA-08 | Cross-agent |
| Store scoping | Domain owner/global contract where semantics are not explicit | Materialize explicit scope | IA-02, IA-04, IA-05, IA-06 | Cross-agent |
| FK delete/update behavior | Relevant semantic owner; global if it changes architecture-wide invariant | Materialize | Relevant agent | Cross-agent |
| SQL enum/status encoding | IA-01 physical choice after semantic catalog is frozen | Materialize | IA-02, IA-04, IA-05 | Cross-agent + local physical |
| Performance-only indexes | IA-01, based on evidence | Propose later | Consumer agent(s) | Deferred / no approval now |
| Idempotency keys for infrastructure | IA-03 | Persist exact contract | IA-07, IA-05 | Cross-agent |
| Correlation/causation fields | Event/infrastructure contract authority IA-03 + event semantics | Persist exact contract | IA-02, IA-04, IA-05, IA-07 | Cross-agent |
| Global contract registry/version authority | Global project authority | Consume only | All | Global decision |

## Authority rule

Semantic owners define meaning. IA-01 owns the physical persistence representation once that meaning is explicit. Ownership of a table does not transfer domain authority to IA-01.
