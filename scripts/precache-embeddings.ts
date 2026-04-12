import { embedMany } from 'ai';
import { embeddingModel } from '../shared/embedding-model.ts';
import { destinations } from '../shared/data/destinations.ts';
import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = join(__dirname, '..', 'shared', 'embeddings.json');

async function precacheEmbeddings() {
  console.log('📦 Generating embeddings for', destinations.length, 'destinations...');
  
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: destinations.map(d => d.description),
  });

  const toCache = destinations.map((d, i) => ({
    name: d.name,
    description: d.description,
    embedding: embeddings[i]!,
  }));

  await writeFile(CACHE_PATH, JSON.stringify(toCache), 'utf-8');
  console.log('✅ Saved embeddings to', CACHE_PATH);
}

precacheEmbeddings();
