import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';

const root = new URL('../../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('./required-gates.json', import.meta.url)));
const sha = process.env.GITHUB_SHA || execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim();
const injected = new Set((process.env.QAOPS_FAIL_GATE || '').split(',').filter(Boolean));
const evidence = { schema: 1, task: manifest.task, commit: sha, gates: [] };
for (const name of manifest.required) {
  const command = manifest.commands[name];
  let ok = false, output = '';
  try {
    if (injected.has(name)) throw new Error(`failure injected for ${name}`);
    output = execSync(command, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    ok = true;
  } catch (error) {
    output = `${error.stdout || ''}${error.stderr || ''}${error.message || ''}`;
  }
  evidence.gates.push({ name, command, status: ok ? 'PASS' : 'FAIL', output_sha256: createHash('sha256').update(output).digest('hex') });
  if (!ok) break;
}
evidence.status = evidence.gates.length === manifest.required.length && evidence.gates.every(g => g.status === 'PASS') ? 'PASS' : 'FAIL';
evidence.manifest_sha256 = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
await mkdir(new URL('../../artifacts/quality-gates/', import.meta.url), { recursive: true });
await writeFile(new URL('../../artifacts/quality-gates/evidence.json', import.meta.url), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
process.exit(evidence.status === 'PASS' ? 0 : 1);
