export const designSystemStatus = "c1-final-foundation" as const;

/** Presentation-only UI primitives. No domain, IPC, transport or persistence contracts. */
export const tokens = {
  typography: { fontFamily: "Inter, Segoe UI, sans-serif", body: 14, label: 12, title: 20, pageTitle: 18 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 28 },
  color: { background: "#f6f7fb", surface: "#fff", text: "#172033", muted: "#687086", border: "#e4e7ef", brand: "#3157d5", success: "#16805b", warning: "#a56700", danger: "#ba3a48" },
  radius: { sm: 8, md: 12, lg: 16, pill: 999 },
  sizing: { control: 40, sidebar: 240, header: 68 },
  elevation: { card: "0 8px 28px rgba(23,32,51,.08)", dialog: "0 16px 48px rgba(14,18,30,.22)" },
  motion: { fast: 120, normal: 180, reduced: 0 },
  focus: { outline: "3px solid rgba(49,87,213,.25)", offset: 2 },
} as const;

export type UiIntegrationState = "REAL_DATA" | "PROVISIONAL_DATA" | "UNAVAILABLE";
export type UiOperationalState = "LOADING" | "EMPTY" | "ERROR" | "SUCCESS" | "UNAVAILABLE" | "OFFLINE" | "PROVISIONAL" | "DISABLED" | "READ_ONLY";
export type BadgeTone = "neutral" | "success" | "warning" | "danger";
export type FormFieldProps = { label: string; required?: boolean; error?: string; disabled?: boolean; readOnly?: boolean };

/** Renderer implementations may be local; this vocabulary is intentionally contract-free. */
export const components = [
  "Button", "Input", "Select", "Dialog", "ConfirmDialog", "Card", "Table", "Badge", "Tabs", "Tooltip", "Toast", "Skeleton", "EmptyState", "ErrorState", "LoadingState", "FormField", "SearchField", "StatusBadge", "EntityCard", "EntityList", "OrderSummary", "MessageComposer"
] as const;

export const isOperationalState = (value: string): value is UiOperationalState =>
  ["LOADING", "EMPTY", "ERROR", "SUCCESS", "UNAVAILABLE", "OFFLINE", "PROVISIONAL", "DISABLED", "READ_ONLY"].includes(value);
