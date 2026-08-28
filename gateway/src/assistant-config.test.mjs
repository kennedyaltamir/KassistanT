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
    assert.match(module.compileAssistantSystemPrompt(saved), /Ana/);
    assert.match(module.compileAssistantSystemPrompt(saved), /Never invent product/);
    const resolution = module.getAssistantPromptResolution();
    assert.equal(resolution.promptId, 'assistant.system');
    assert.equal(resolution.promptVersion, '1.0.0');
    assert.ok(resolution.configurationVersion);
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
