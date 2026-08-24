export type UiIntegrationState = "REAL_DATA" | "PROVISIONAL_DATA" | "UNAVAILABLE";

/** Presentation-only, provisional and non-canonical models for the C1 renderer. */
export type UiProduct = { id: string; name: string; price: number };
export type UiOrderItem = { id: string; name: string; quantity: number; unit_price: number; modifiers: string[] };
export type UiOrder = { id: string; status: "DRAFT" | "CONFIRMED"; items: UiOrderItem[] };
export type UiConversation = { id: string; name: string };

export const createDesktopShell = () => ({
  status: "operational-presentation" as const,
  integration: "PROVISIONAL_DATA" as UiIntegrationState,
});
