import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const expected = ['lint','typecheck','unit','integration','build','security','supply-chain'];
const manifest = JSON.parse(await readFile(new URL('./required-gates.json', import.meta.url)));
assert.deepEqual(manifest.required, expected, 'silent gate weakening detected');
for (const gate of expected) assert.ok(manifest.commands[gate], `missing command for ${gate}`);
console.log('quality-gate policy: PASS');
