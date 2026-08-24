export const designSystemStatus = "operational-foundation" as const;

/** Presentation-only UI primitives. They intentionally carry no domain or transport contracts. */
export const tokens = {
  typography: { fontFamily: "Inter, Segoe UI, sans-serif", body: 14, label: 12, title: 20 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  radius: { sm: 8, md: 12, lg: 16 },
  sizing: { control: 40, sidebar: 240 },
  elevation: { card: "0 8px 28px rgba(23,32,51,.08)" },
  motion: { fast: 120, normal: 180 },
} as const;

export type UiState = "REAL_DATA" | "PROVISIONAL_DATA" | "UNAVAILABLE";
export type BadgeTone = "neutral" | "success" | "warning" | "danger";
export type FormFieldProps = { label: string; required?: boolean; error?: string };

// Component vocabulary exported for renderer adapters; implementations remain renderer-local until the build pipeline bundles React.
export const components = ["Button", "Input", "Select", "Dialog", "ConfirmDialog", "Card", "Table", "Badge", "Tabs", "Tooltip", "Toast", "Skeleton", "EmptyState", "ErrorState", "LoadingState", "FormField"] as const;
