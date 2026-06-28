import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const requiredPaths = [
  'AGENTS.md',
  'README.md',
  'docs/architecture.md',
  'docs/quality.md',
  'docs/reliability.md',
  'docs/security.md',
  'docs/references.md',
  'docs/exec-plans/README.md',
  'docs/exec-plans/active',
  'docs/exec-plans/completed',
];

const requiredAgentLinks = [
  'README.md',
  'docs/architecture.md',
  'docs/quality.md',
  'docs/exec-plans/active/',
  'docs/exec-plans/completed/',
];

const missingPaths = requiredPaths.filter(
  (relativePath) => !existsSync(path.join(root, relativePath)),
);

if (missingPaths.length > 0) {
  throw new Error(`Missing required docs paths:\n${missingPaths.join('\n')}`);
}

const agentsGuide = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
const missingAgentLinks = requiredAgentLinks.filter(
  (link) => !agentsGuide.includes(link),
);

if (missingAgentLinks.length > 0) {
  throw new Error(
    `AGENTS.md is missing required references:\n${missingAgentLinks.join('\n')}`,
  );
}

console.log('Documentation structure is valid.');
