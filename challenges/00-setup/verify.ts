import { generateText, embed } from 'ai';
import { model } from '../../shared/model.ts';
import { embeddingModel } from '../../shared/embedding-model.ts';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

let passed = 0;
let failed = 0;

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`  [FAIL] ${name}`);
    console.log(`         ${msg}`);
    failed++;
  }
}

async function main() {
  console.log('\nTripMate Quick Workshop - Setup Verification\n');
  console.log(`Ollama URL: ${OLLAMA_BASE_URL}\n`);

  console.log('--- Environment ---\n');

  await check('Challenge directories exist', async () => {
    const required = [
      'challenges/03-tools/start',
      'challenges/03-tools/finish',
      'challenges/04-multi-agent/start',
      'challenges/04-multi-agent/finish',
      'challenges/05-rag/start',
      'challenges/05-rag/finish',
      'challenges/06-ui/src',
    ];
    const missing = required.filter(p => !existsSync(join(root, p)));
    if (missing.length > 0) {
      throw new Error(`Missing directories:\n           ${missing.join('\n           ')}`);
    }
    console.log(`         All ${required.length} challenge directories found`);
  });

  await check('UI dependencies installed (06-ui)', async () => {
    const uiNodeModules = join(root, 'challenges/06-ui/node_modules');
    if (!existsSync(uiNodeModules)) {
      throw new Error('Run: npm --prefix challenges/06-ui install');
    }
  });

  console.log('\n--- Ollama ---\n');

  await check('Ollama is reachable', async () => {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { models: Array<{ name: string }> };
    console.log(`         Found ${data.models.length} models installed`);
  });

  await check('granite4:latest model available', async () => {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const data = (await res.json()) as { models: Array<{ name: string }> };
    const hasModel = data.models.some((m: { name: string }) => m.name.includes('granite4'));
    if (!hasModel) throw new Error('Run: ollama pull granite4:latest');
  });

  await check('embeddinggemma:latest model available', async () => {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const data = (await res.json()) as { models: Array<{ name: string }> };
    const hasModel = data.models.some((m: { name: string }) => m.name.includes('embeddinggemma'));
    if (!hasModel) throw new Error('Run: ollama pull embeddinggemma:latest');
  });

  console.log('\n--- Functional ---\n');

  await check('Text generation works', async () => {
    const { text } = await generateText({ model, prompt: 'Say "hello" and nothing else.' });
    if (!text) throw new Error('Empty response');
    console.log(`         Model responded: "${text.trim().slice(0, 50)}"`);
  });

  await check('Embeddings work', async () => {
    const { embedding } = await embed({ model: embeddingModel, value: 'test embedding' });
    if (!embedding || embedding.length === 0) throw new Error('Empty embedding');
    console.log(`         Embedding dimensions: ${embedding.length}`);
  });

  console.log(`\n--- Result: ${passed} passed, ${failed} failed ---\n`);
  if (failed > 0) {
    console.log('Fix the failures above, then run this script again.\n');
    process.exit(1);
  } else {
    console.log('All checks passed — you are ready to start the workshop!\n');
  }
}

main().catch(console.error);
