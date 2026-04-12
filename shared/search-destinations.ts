import { embed, embedMany, cosineSimilarity } from 'ai';
import { embeddingModel } from './embedding-model.ts';
import { destinations } from './data/destinations.ts';
import { trace } from 'autotel';
import { readFile, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = join(__dirname, 'embeddings.json');

interface CachedEmbedding {
  name: string;
  description: string;
  embedding: number[];
}

let cachedEmbeddings: number[][] | null = null;

async function loadFromDisk(): Promise<CachedEmbedding[] | null> {
  try {
    await access(CACHE_PATH);
    const raw = await readFile(CACHE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveToDisk(data: CachedEmbedding[]): Promise<void> {
  await writeFile(CACHE_PATH, JSON.stringify(data), 'utf-8');
}

async function getEmbeddings(): Promise<number[][]> {
  if (cachedEmbeddings) return cachedEmbeddings;

  const cached = await loadFromDisk();
  if (cached && cached.length === destinations.length) {
    console.log('📂 Loaded cached embeddings from disk.');
    cachedEmbeddings = cached.map(c => c.embedding);
    return cachedEmbeddings;
  }

  console.log('📦 Embedding destinations (first run only)...');
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: destinations.map(d => d.description),
  });

  const toCache: CachedEmbedding[] = destinations.map((d, i) => ({
    name: d.name,
    description: d.description,
    embedding: embeddings[i]!,
  }));
  await saveToDisk(toCache);

  cachedEmbeddings = embeddings;
  console.log(`✅ Embedded ${destinations.length} destinations.\n`);
  return embeddings;
}

export const searchDestinations = trace('searchDestinations', (ctx) => async (query: string, topK: number = 3): Promise<Array<{ name: string; description: string; budget: string; similarity: number }>> => {
  const docEmbeddings = await getEmbeddings();
  ctx.setAttributes({
    'search.destinations.count': docEmbeddings.length,
  });

  const { embedding: queryEmbedding } = await embed({
    model: embeddingModel,
    value: query,
  });

  const results = docEmbeddings.map((docEmb, i) => ({
    name: destinations[i]!.name,
    description: destinations[i]!.description,
    budget: destinations[i]!.budget,
    similarity: cosineSimilarity(queryEmbedding, docEmb),
  }));

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
});
