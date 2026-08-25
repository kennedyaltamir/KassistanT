const DAY_NAMES = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];

function parseTime(value) {
  const text = String(value ?? "");

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) {
    return null;
  }

  const hour = Number(text.slice(0, 2));
  const minute = Number(text.slice(3, 5));

  return hour * 60 + minute;
}

function getTimezoneParts(date, timezone) {
  let formatter;

  try {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
  } catch (error) {
    throw new Error(
      `INVALID_TIMEZONE: ${String(
        error instanceof Error ? error.message : error
      )}`
    );
  }

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );

  return {
    day: String(parts.weekday ?? "").toLowerCase(),
    minutes:
      Number(parts.hour ?? 0) * 60 +
      Number(parts.minute ?? 0)
  };
}

function isBusinessOpenAt(config, date = new Date()) {
  if (!config || config.enabled === false) {
    return false;
  }

  const timezone =
    String(
      config.timezone ||
      "America/Sao_Paulo"
    ).trim() || "America/Sao_Paulo";

  const { day, minutes } =
    getTimezoneParts(date, timezone);

  if (!DAY_NAMES.includes(day)) {
    return false;
  }

  const intervals = Array.isArray(
    config.business_hours?.[day]
  )
    ? config.business_hours[day]
    : [];

  return intervals.some((interval) => {
    const open = parseTime(interval?.open);
    const close = parseTime(interval?.close);

    return (
      open !== null &&
      close !== null &&
      close > open &&
      minutes >= open &&
      minutes < close
    );
  });
}

function normalizeContextBoolean(value) {
  return value === true;
}

function selectCustomerContext(
  customer,
  history,
  policy = {}
) {
  const source =
    customer &&
    typeof customer === "object"
      ? customer
      : {};

  const conversationHistory =
    Array.isArray(history)
      ? history
      : [];

  const result = {};

  if (normalizeContextBoolean(policy.name)) {
    result.name = source.name ?? null;
  }

  if (normalizeContextBoolean(policy.phone)) {
    result.phone = source.phone ?? null;
  }

  if (
    normalizeContextBoolean(
      policy.whatsapp_id
    )
  ) {
    result.whatsapp_id =
      source.whatsapp_id ??
      source.whatsappId ??
      null;
  }

  if (
    normalizeContextBoolean(
      policy.preferences
    )
  ) {
    result.preferences =
      source.preferences ?? null;
  }

  if (
    normalizeContextBoolean(
      policy.order_history
    )
  ) {
    result.order_history =
      source.order_history ??
      source.orderHistory ??
      null;
  }

  if (
    normalizeContextBoolean(
      policy.relationship
    )
  ) {
    result.relationship =
      source.relationship ?? null;
  }

  if (
    normalizeContextBoolean(
      policy.address
    )
  ) {
    result.address =
      source.address ?? null;
  }

  if (
    normalizeContextBoolean(
      policy.email
    )
  ) {
    result.email =
      source.email ?? null;
  }

  if (
    normalizeContextBoolean(
      policy.conversation_history
    )
  ) {
    const historyPolicy =
      policy.history_policy &&
      typeof policy.history_policy === "object"
        ? policy.history_policy
        : {};

    const historyEnabled =
      historyPolicy.enabled !== false;

    const requestedLimit = Number(
      historyPolicy.max_messages ??
      historyPolicy.maxMessages ??
      30
    );

    const maxMessages = Number.isFinite(
      requestedLimit
    )
      ? Math.max(
          1,
          Math.min(
            200,
            Math.trunc(requestedLimit)
          )
        )
      : 30;

    result.conversation_history =
      historyEnabled
        ? conversationHistory.slice(
            -maxMessages
          )
        : [];
  }

  return result;
}

function buildAssistantContext({
  configuration,
  customer,
  history
}) {
  const config =
    configuration &&
    typeof configuration === "object"
      ? configuration
      : {};

  const business = {
    company_name:
      config.company_name ?? "",
    company_address:
      config.company_address ?? "",
    timezone:
      config.timezone ??
      "America/Sao_Paulo",
    is_open:
      isBusinessOpenAt(config),
    business_hours:
      config.business_hours ?? {}
  };

  const assistant = {
    name:
      config.assistant_name ??
      "Kassis",
    language:
      config.language ??
      "pt-BR",
    conversation_mode:
      config.conversation_mode ??
      "CORDIAL",
    behavior_instructions:
      config.behavior_instructions ??
      ""
  };

  const customerContext =
    selectCustomerContext(
      customer,
      history,
      {
        ...(
          config.customer_context_policy &&
          typeof config.customer_context_policy ===
            "object"
            ? config.customer_context_policy
            : {}
        ),
        history_policy:
          config.history_policy &&
          typeof config.history_policy ===
            "object"
            ? config.history_policy
            : {
                enabled: true,
                max_messages: 30
              }
      }
    );

  return Object.freeze({
    business: Object.freeze(
      business
    ),
    assistant: Object.freeze(
      assistant
    ),
    customer: Object.freeze(
      customerContext
    )
  });
}

module.exports = {
  DAY_NAMES,
  parseTime,
  getTimezoneParts,
  isBusinessOpenAt,
  selectCustomerContext,
  buildAssistantContext
};
