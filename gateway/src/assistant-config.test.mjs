import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const moduleUrl = new URL('./assistant-config.mjs', import.meta.url);

async function loadWithTempConfig() {
  const original = process.env.KASSIST_ASSISTANT_CONFIG_PATH;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kassist-assistant-'));
  const file = path.join(dir, 'assistant-config.json');
  process.env.KASSIST_ASSISTANT_CONFIG_PATH = file;
  const module = await import(`${moduleUrl.href}?test=${Date.now()}-${Math.random()}`);
  return {
    module,
    file,
    restore() {
      if (original === undefined) delete process.env.KASSIST_ASSISTANT_CONFIG_PATH;
      else process.env.KASSIST_ASSISTANT_CONFIG_PATH = original;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };
}

test('normalizes structured assistant configuration and persists it', async () => {
  const { module, file, restore } = await loadWithTempConfig();
  try {
    const saved = module.updateAssistantConfig({
      assistantName: 'Ana',
      businessName: 'Loja Central',
      role: 'Atendente de vendas',
      personality: 'Objetiva e cordial',
      toneOfVoice: 'Profissional e próxima',
      responseFormat: 'concise_text',
      commercialRules: 'Não conceder descontos fora da política.',
      deliveryFeePolicy: { enabled: true, amountCents: 799, currency: 'BRL', rule: 'Cobrar em pedidos para fora da área de retirada.' },
      deliveryInstructions: 'Informar prazo somente quando disponível.',
      businessHours: [{ day: 'MONDAY', open: '09:00', close: '18:00', closed: false }],
      behaviorInstructions: 'Confirmar dados antes de registrar pedidos.',
      limitations: 'Não realizar reembolso automaticamente.',
      llm: { provider: 'ollama', model: 'qwen3:14b', baseUrl: 'http://127.0.0.1:11434' },
      autoReplyEnabled: true
    });
    assert.equal(saved.assistantName, 'Ana');
    assert.equal(saved.deliveryFeePolicy.amountCents, 799);
    assert.equal(saved.businessHours[0].day, 'MONDAY');
    assert.ok(fs.existsSync(file));
    const prompt = module.compileAssistantSystemPrompt(saved);
    assert.match(prompt, /Ana/);
    assert.match(prompt, /Never invent product/);
    for (const section of [
      'ASSISTANT_IDENTITY', 'BUSINESS_IDENTITY', 'ROLE', 'PERSONALITY', 'TONE',
      'COMMERCIAL_POLICIES', 'DELIVERY_POLICIES', 'BUSINESS_HOURS', 'PRODUCT_CATALOG',
      'CUSTOMER_CONTEXT', 'CONVERSATION_CONTEXT', 'AUTHORIZED_MEMORY', 'CURRENT_STATE',
      'RESPONSE_POLICY', 'LIMITATIONS', 'TOOL_POLICY', 'IDENTITY_SAFETY_POLICY'
    ]) assert.match(prompt, new RegExp(section));
    const resolution = module.getAssistantPromptResolution();
    assert.equal(resolution.promptId, 'assistant.system');
    assert.equal(resolution.promptVersion, '1.2.0');
    assert.ok(resolution.configurationVersion);
  } finally {
    restore();
  }
});

test('accepts renderer response format aliases and delivery policy modes', async () => {
  const { module, restore } = await loadWithTempConfig();
  try {
    const saved = module.updateAssistantConfig({
      responseFormat: 'structured',
      deliveryFeePolicy: 'FIXED',
      llm: { model: 'qwen3:14b', baseUrl: 'http://localhost:11434' }
    });
    assert.equal(saved.responseFormat, 'bullet_points');
    assert.equal(saved.deliveryFeePolicy.enabled, true);
    assert.equal(saved.deliveryFeePolicy.amountCents, null);
    assert.equal(saved.llm.model, 'qwen3:14b');
    assert.equal(saved.llm.baseUrl, 'http://localhost:11434');
  } finally {
    restore();
  }
});

test('rejects invalid delivery fee cents and business hours', async () => {
  const { module, restore } = await loadWithTempConfig();
  try {
    assert.throws(() => module.updateAssistantConfig({ deliveryFeePolicy: { enabled: true, amountCents: 1.5 } }), /non-negative integer in cents/);
    assert.throws(() => module.updateAssistantConfig({ businessHours: [{ day: 'MONDAY', open: '9:00', close: '18:00' }] }), /Invalid business hour/);
  } finally {
    restore();
  }
});

test('rejects non-local assistant LLM endpoint', async () => {
  const { module, restore } = await loadWithTempConfig();
  try {
    assert.throws(() => module.updateAssistantConfig({ llm: { baseUrl: 'https://example.invalid' } }), /local Ollama/);
  } finally {
    restore();
  }
});