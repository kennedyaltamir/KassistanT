# Campaign Dispatch — Desktop/Gateway Media Root Boundary — 2026-08-28

## Contexto

A validação Windows anterior do Campaign Dispatch mostrou uma falha real de IMAGE no Gateway que atendia a porta 3210. O Desktop selecionou e registrou corretamente um asset, mas o Gateway foi iniciado por PowerShell/VSCode/pnpm com `KASSIST_GATEWAY_AUTOSTART=false` no processo do Desktop, portanto não recebeu a injeção de `KASSIST_MEDIA_ROOT` feita pelo Electron.

O Batch persistiu a causa terminal:

`Controlled media transport root is not configured`

O Campaign snapshot preservou `imageReference`, `imageVariantId`, MIME, tamanho e caption; o arquivo existia fisicamente.

## Causa raiz

O contrato anterior dependia de `KASSIST_MEDIA_ROOT` estar presente no ambiente do processo Gateway. O Electron já injetava essa variável quando era o launcher do Gateway, mas o mecanismo documentado de desenvolvimento (`pnpm dev`) executava `node src/main.mjs` diretamente, sem estabelecer essa variável quando o Gateway era iniciado fora do Electron.

## Decisão

Manter `KASSIST_MEDIA_ROOT` como boundary obrigatório de segurança no `sendImage()` e tornar apenas o mecanismo de desenvolvimento determinístico.

Quando `gateway/src/main.mjs` é executado através do lifecycle `dev` e `KASSIST_MEDIA_ROOT` está ausente, o entrypoint determina a raiz de desenvolvimento a partir de `%APPDATA%` no Windows e usa:

`%APPDATA%\Electron\campaigns\images`

Essa convenção corresponde ao `app.getPath("userData")\campaigns\images` usado pelo Electron em desenvolvimento no ambiente validado.

Quando `KASSIST_MEDIA_ROOT` já está definido, seu valor explícito prevalece.

Quando o lifecycle não é `dev`, nenhum fallback de desenvolvimento é aplicado. A proteção de `sendImage()` permanece inalterada: o asset continua sujeito a root autorizado, existência, arquivo não vazio e formato de imagem suportado.

## Implementação

`gateway/src/main.mjs` passou a:

- determinar uma raiz de mídia de desenvolvimento somente no lifecycle `dev`;
- preservar `KASSIST_MEDIA_ROOT` explicitamente configurado;
- aplicar a variável antes de importar `http.mjs`, `whatsapp.mjs` e os demais módulos do runtime;
- manter o entrypoint executável isolado de imports de runtime quando carregado por testes.

`apps/desktop/electron/main.cjs` não precisou de alteração: o Electron já injeta `KASSIST_MEDIA_ROOT` com o mesmo diretório de campanhas quando inicia o Gateway.

Nenhuma segunda engine de dispatch foi criada. `CampaignDispatchRuntime`, `BatchDispatchRuntime`, pacing, retry, confirmation, snapshot e recovery permanecem fora desta alteração.

## Segurança

- Renderer continua sem acesso arbitrário ao filesystem.
- Baileys e auth state permanecem no Gateway.
- `sendImage()` continua recusando referência fora da raiz autorizada.
- Não foi removida a exigência de validação do media root.
- Nenhum segredo, token ou material de autenticação é propagado ao Renderer.

## Evidência automatizada

Commit validado pela CI:

`90f13152d7d1b8f824236a48d892a22a96dbf98b`

A execução CI desse commit concluiu com sucesso em:

- Install dependencies
- Lint
- Typecheck
- Tests
- Build

O teste adicionado cobre:

- resolução da raiz de desenvolvimento Windows;
- prioridade de `KASSIST_MEDIA_ROOT` explícito;
- aplicação do fallback somente no lifecycle `dev`;
- ausência de fallback sem `APPDATA`;
- injeção estática de `KASSIST_MEDIA_ROOT` pelo Electron;
- preservação da boundary de segurança de `sendImage()`.

## Validação funcional

Status pós-correção neste registro:

- IMPLEMENTED: PASS
- AUTOMATED_TESTED: PASS
- LOCAL_WINDOWS_TESTED: NOT TESTED AFTER FIX
- REAL_WHATSAPP_TESTED: NOT TESTED AFTER FIX
- IMAGE_WITHOUT_CAPTION: NOT TESTED AFTER FIX
- IMAGE_WITH_MESSAGE_CAPTION: NOT TESTED AFTER FIX
- PROVIDER_OBSERVATION: NOT TESTED AFTER FIX
- PERSISTENCE: NOT TESTED AFTER FIX
- UTF-8: NOT TESTED AFTER FIX

A validação funcional deve utilizar o Gateway efetivamente responsável pela porta 3210, com `KASSIST_MEDIA_ROOT` observável e sem executar duas instâncias simultâneas do Gateway.

## Limitações

A convenção automática para desenvolvimento é específica ao atual runtime Windows/Electron, cujo `userData` em desenvolvimento corresponde a `%APPDATA%\Electron`. Uma futura alteração formal do nome de aplicação ou da localização de `userData` deve atualizar esse contrato por Change Unit apropriada.

`pnpm qa:gates` não foi executado pela CI deste commit e continua pendente de validação local/operacional.

## Arquivos relacionados

- `gateway/src/main.mjs`
- `gateway/src/main-runtime-config.test.mjs`
- `apps/desktop/electron/main.cjs`
- `gateway/src/whatsapp.mjs`
- `gateway/src/campaign-dispatch.mjs`
- `gateway/src/batch-dispatch.mjs`

## Commits relacionados

- `7e70cd90a9b4e08ae0dd31444ab6f401bbb4cf3a` — deterministic development media root
- `679a8a21432101ef2c6a2468744c7925120d52a6` — portable entrypoint detection
- `90f13152d7d1b8f824236a48d892a22a96dbf98b` — runtime configuration tests
- `2aa27a93a8fe1f62ae64c3a5aec98809ae01a423` — protected MVP2 baseline

## Status

IMPLEMENTATION COMPLETE / AUTOMATED VALIDATION PASS / FUNCTIONAL WINDOWS AND REAL WHATSAPP VALIDATION PENDING
