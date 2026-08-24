export type UiIntegrationState = "REAL" | "DERIVED" | "PROVISIONAL_DATA" | "UNKNOWN" | "UNAVAILABLE";
export type CustomerUiStatus = "IDLE" | "VALIDATION_ERROR" | "INTERACTION_SUCCESS" | "INTERACTION_ERROR" | "UNAVAILABLE";
export type CustomerPersistenceStatus = "PERSISTENCE_SUCCESS" | "PERSISTENCE_ERROR" | "UNAVAILABLE" | "UNKNOWN";

/** Presentation-only, provisional and non-canonical models for the C1 renderer. */
export type UiProduct = { id: string; name: string; price: number };
export type UiOrderItem = { id: string; name: string; quantity: number; unit_price: number; modifiers: string[] };
export type UiOrder = { id: string; status: "DRAFT" | "CONFIRMED"; items: UiOrderItem[] };
export type UiConversation = { id: string; name: string };

/**
 * Customer presentation identity is never Customer.id unless a real authorized
 * source supplied it. Local fixture identifiers are explicitly non-canonical.
 */
export type UiCustomer = {
  presentation_id: string;
  identity_source: "PROVISIONAL_PRESENTATION_ID" | "ID_DERIVED_FROM_REAL_SOURCE";
  phone: string;
  name?: string;
  data_status: UiIntegrationState;
};

export type CustomerOperationState = {
  ui_status: CustomerUiStatus;
  persistence_status: CustomerPersistenceStatus;
};

export const unavailableCustomerOperation = (): CustomerOperationState => ({
  ui_status: "IDLE",
  persistence_status: "UNAVAILABLE",
});

export const validateCustomerPresentationInput = (input: { phone?: string; name?: string }) => {
  const phone = input.phone?.trim() ?? "";
  const name = input.name?.trim() ?? "";
  if (!phone) return { ok: false as const, field: "phone" as const, message: "Telefone é obrigatório." };
  if (name.length > 0 && name.length < 2) return { ok: false as const, field: "name" as const, message: "Informe ao menos 2 caracteres ou deixe o nome em branco." };
  return { ok: true as const, phone, name: name || undefined };
};

export const createDesktopShell = () => ({
  status: "operational-presentation" as const,
  integration: "PROVISIONAL_DATA" as UiIntegrationState,
  customer_create: unavailableCustomerOperation(),
  customer_edit: unavailableCustomerOperation(),
});
