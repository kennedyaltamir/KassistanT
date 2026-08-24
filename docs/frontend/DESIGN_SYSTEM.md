# DESIGN SYSTEM

Status: `FOUNDATION_IMPLEMENTED`.

## Implemented foundation

Tokens em `packages/ui/src/index.ts`: typography, spacing, color, radius, sizing, elevation, motion e focus. O package também declara tipos, estados e um vocabulário de componentes esperado para a superfície C1.

## Evidence boundary

`DESIGN_SYSTEM = TOKENS_AND_COMPONENT_VOCABULARY_IMPLEMENTED`

`REUSABLE_COMPONENT_IMPLEMENTATIONS = NOT_PROVEN / PARTIAL`

O vocabulário inclui Button, Input, Select, Dialog, ConfirmDialog, Card, Table, Badge, Tabs, Tooltip, Toast, Skeleton, EmptyState, ErrorState, LoadingState, FormField, SearchField, StatusBadge, EntityCard, EntityList, OrderSummary e MessageComposer.

Essa lista é um vocabulário/documentação de componentes; ela não prova que cada item exista como componente React/UI reutilizável funcional em `packages/ui`. As implementações atuais podem permanecer renderer-local. Um componente só deve ser classificado como implementação reutilizável quando sua implementação concreta e seu comportamento forem estabelecidos no package correspondente.

O package não declara DTOs nem contratos de backend.