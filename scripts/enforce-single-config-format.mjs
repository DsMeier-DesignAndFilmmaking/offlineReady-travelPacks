import { access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const rules = [
  {
    canonical: 'vite.config.ts',
    prohibited: ['vite.config.js', 'vite.config.mjs', 'vite.config.cjs'],
  },
  {
    canonical: 'src/main.tsx',
    prohibited: ['src/main.jsx', 'src/main.js'],
  },
  {
    canonical: 'src/sw.ts',
    prohibited: ['src/sw.js', 'public/sw.js'],
  },
  {
    canonical: 'tsconfig.app.json',
    prohibited: ['tsconfig.app.ts', 'tsconfig.app.js'],
  },
];

const exists = async (relativePath) => {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
};

const violations = [];

for (const rule of rules) {
  const canonicalExists = await exists(rule.canonical);

  if (!canonicalExists) {
    violations.push(`Missing canonical file: ${rule.canonical}`);
    continue;
  }

  for (const blockedPath of rule.prohibited) {
    if (await exists(blockedPath)) {
      violations.push(`Remove duplicate file format: ${blockedPath} (canonical: ${rule.canonical})`);
    }
  }
}

if (violations.length > 0) {
  console.error('Configuration guardrail failed:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log('Configuration guardrail passed.');
