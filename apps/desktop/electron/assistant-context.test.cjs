const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseTime,
  isBusinessOpenAt,
  selectCustomerContext,
  buildAssistantContext
} = require("./assistant-context.cjs");

test(
  "parseTime preserves valid HH:mm values",
  () => {
    assert.equal(parseTime("08:00"), 480);
    assert.equal(parseTime("18:30"), 1110);
    assert.equal(parseTime("23:59"), 1439);
    assert.equal(parseTime("99:99"), null);
    assert.equal(parseTime("18"), null);
  }
);

test(
  "business hours are deterministic and timezone-aware",
  () => {
    const configuration = {
      enabled: true,
      timezone: "America/Sao_Paulo",
      business_hours: {
        monday: [
          {
            open: "08:00",
            close: "12:00"
          },
          {
            open: "13:00",
            close: "18:00"
          }
        ]
      }
    };

    // 14:00 UTC = 11:00 BRT
    assert.equal(
      isBusinessOpenAt(
        configuration,
        new Date("2026-08-24T14:00:00Z")
      ),
      true
    );

    // 20:59 UTC = 17:59 BRT
    assert.equal(
      isBusinessOpenAt(
        configuration,
        new Date("2026-08-24T20:59:00Z")
      ),
      true
    );

    // 21:00 UTC = 18:00 BRT, interval is half-open [open, close)
    assert.equal(
      isBusinessOpenAt(
        configuration,
        new Date("2026-08-24T21:00:00Z")
      ),
      false
    );
  }
);

test(
  "business hours remain closed outside configured intervals",
  () => {
    const configuration = {
      enabled: true,
      timezone: "America/Sao_Paulo",
      business_hours: {
        monday: [
          {
            open: "08:00",
            close: "12:00"
          }
        ]
      }
    };

    // 11:00 UTC = 08:00 BRT
    assert.equal(
      isBusinessOpenAt(
        configuration,
        new Date("2026-08-24T11:00:00Z")
      ),
      true
    );

    // 15:00 UTC = 12:00 BRT, exactly at close
    assert.equal(
      isBusinessOpenAt(
        configuration,
        new Date("2026-08-24T15:00:00Z")
      ),
      false
    );
  }
);

test(
  "disabled assistant is never considered open",
  () => {
    const configuration = {
      enabled: false,
      timezone: "America/Sao_Paulo",
      business_hours: {
        monday: [
          {
            open: "00:00",
            close: "23:59"
          }
        ]
      }
    };

    assert.equal(
      isBusinessOpenAt(
        configuration,
        new Date("2026-08-24T14:00:00Z")
      ),
      false
    );
  }
);

test(
  "customer context only exposes explicitly authorized categories",
  () => {
    const customer = {
      name: "Maria",
      phone: "+5511999999999",
      whatsapp_id: "123@lid",
      preferences: {
        short_answers: true
      },
      order_history: [
        { id: "order-1" }
      ],
      relationship: "VIP",
      address: "Rua A",
      email: "maria@example.com"
    };

    const history = [
      { id: "m1" },
      { id: "m2" },
      { id: "m3" }
    ];

    const result = selectCustomerContext(
      customer,
      history,
      {
        name: true,
        phone: false,
        whatsapp_id: true,
        preferences: true,
        order_history: true,
        relationship: false,
        address: false,
        email: false,
        conversation_history: true,
        history_policy: {
          enabled: true,
          max_messages: 2
        }
      }
    );

    assert.equal(result.name, "Maria");
    assert.equal(result.phone, undefined);
    assert.equal(result.whatsapp_id, "123@lid");

    assert.deepEqual(
      result.conversation_history,
      [
        { id: "m2" },
        { id: "m3" }
      ]
    );

    assert.equal(result.relationship, undefined);
    assert.equal(result.address, undefined);
    assert.equal(result.email, undefined);
  }
);

test(
  "conversation history can be disabled independently",
  () => {
    const result = selectCustomerContext(
      { name: "Maria" },
      [{ id: "m1" }],
      {
        name: true,
        conversation_history: true,
        history_policy: {
          enabled: false,
          max_messages: 30
        }
      }
    );

    assert.deepEqual(
      result.conversation_history,
      []
    );
  }
);

test(
  "history is bounded to maximum supported window",
  () => {
    const history = Array.from(
      { length: 250 },
      (_, index) => ({
        id: `m-${index + 1}`
      })
    );

    const result = selectCustomerContext(
      {},
      history,
      {
        conversation_history: true,
        history_policy: {
          enabled: true,
          max_messages: 999
        }
      }
    );

    assert.equal(
      result.conversation_history.length,
      200
    );

    assert.equal(
      result.conversation_history[0].id,
      "m-51"
    );
  }
);

test(
  "buildAssistantContext separates business, assistant and customer context",
  () => {
    const context = buildAssistantContext({
      configuration: {
        enabled: true,
        company_name: "Kassis Burger",
        company_address: "Rua A, 100",
        timezone: "America/Sao_Paulo",
        business_hours: {},
        assistant_name: "Ana",
        language: "pt-BR",
        conversation_mode: "PROFESSIONAL",
        behavior_instructions: "Seja objetiva.",
        customer_context_policy: {
          name: true,
          conversation_history: false
        },
        history_policy: {
          enabled: false,
          max_messages: 30
        }
      },
      customer: {
        name: "Maria",
        email: "maria@example.com"
      },
      history: [
        { id: "m1" }
      ]
    });

    assert.equal(
      context.business.company_name,
      "Kassis Burger"
    );

    assert.equal(
      context.assistant.name,
      "Ana"
    );

    assert.equal(
      context.customer.name,
      "Maria"
    );

    assert.equal(
      context.customer.email,
      undefined
    );

    assert.equal(
      context.customer.conversation_history,
      undefined
    );
  }
);

test(
  "invalid timezone fails explicitly instead of silently deciding",
  () => {
    assert.throws(
      () =>
        isBusinessOpenAt(
          {
            enabled: true,
            timezone: "Invalid/Timezone",
            business_hours: {}
          },
          new Date("2026-08-24T14:00:00Z")
        ),
      /INVALID_TIMEZONE/
    );
  }
);

