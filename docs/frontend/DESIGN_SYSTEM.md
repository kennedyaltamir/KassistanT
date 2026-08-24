# DESIGN SYSTEM

Status: IMPLEMENTED foundation.

Tokens em `packages/ui/src/index.ts`: typography, spacing, color, radius, sizing, elevation, motion e focus. Vocabulário: Button, Input, Select, Dialog, ConfirmDialog, Card, Table, Badge, Tabs, Tooltip, Toast, Skeleton, EmptyState, ErrorState, LoadingState, FormField, SearchField, StatusBadge, EntityCard, EntityList, OrderSummary e MessageComposer.

Os componentes continuam presentation-only. O package não declara DTOs nem contratos de backend. Implementações concretas podem permanecer renderer-local até existir uma necessidade real de compartilhamento.
