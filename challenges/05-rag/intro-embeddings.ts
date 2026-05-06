// Intro: What are embeddings and why do they matter for AI?
//
// This short exercise builds your intuition BEFORE the main challenge.
// You will embed a few destinations, search them, and see exactly
// what the model would receive as context.
//
// Run: npm run q3:intro

import { embed, embedMany, cosineSimilarity } from 'ai';
import { embeddingModel } from '../../shared/embedding-model.ts';

// ── Step 1: Start with just 2 destinations ──────────────────────────
const destinations = [
  {
    name: 'Tokyo, Japan',
    description: 'A dazzling metropolis where ancient temples sit alongside neon-lit skyscrapers. Explore world-class street food, tranquil gardens, and cutting-edge technology.',
  },
  {
    name: 'Reykjavik, Iceland',
    description: 'Gateway to glaciers, geysers, and the Northern Lights. A cold-weather adventure destination with dramatic volcanic landscapes and geothermal hot springs.',
  },
];

async function search(query: string, docs: typeof destinations, topK: number) {
  // Embed all destination descriptions into vectors
  const { embeddings: docEmbeddings } = await embedMany({
    model: embeddingModel,
    values: docs.map(d => d.description),
  });

  // Embed the search query into the same vector space
  const { embedding: queryEmbedding } = await embed({
    model: embeddingModel,
    value: query,
  });

  // Score every destination by how similar it is to the query
  const scored = docs.map((doc, i) => ({
    name: doc.name,
    description: doc.description,
    similarity: cosineSimilarity(queryEmbedding, docEmbeddings[i]!),
  }));

  // Sort best match first, return only the top K
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

async function main() {
  const query = 'warm beach holiday on a budget';

  // ── Search with 2 destinations ──────────────────────────────────
  console.log('═══════════════════════════════════════════════');
  console.log('  STEP 1: Search 2 destinations');
  console.log('═══════════════════════════════════════════════');
  console.log(`\n  Query: "${query}"\n`);

  const results1 = await search(query, destinations, 2);
  for (const r of results1) {
    console.log(`  ${r.similarity.toFixed(3)}  ${r.name}`);
  }

  console.log('\n  Neither is a beach destination, but the model');
  console.log('  would have to pick from these — it only sees');
  console.log('  what we give it.\n');

  // ── Step 2: Add a destination that actually matches ─────────────
  console.log('═══════════════════════════════════════════════');
  console.log('  STEP 2: Add Bali and search again');
  console.log('═══════════════════════════════════════════════\n');

  destinations.push({
    name: 'Bali, Indonesia',
    description: 'A tropical paradise known for stunning rice terraces, pristine beaches, and affordable luxury. Incredible surfing, warm hospitality, and vibrant nightlife year-round.',
  });

  const results2 = await search(query, destinations, 2);
  console.log(`  Query: "${query}"\n`);
  for (const r of results2) {
    console.log(`  ${r.similarity.toFixed(3)}  ${r.name}`);
  }

  console.log('\n  Bali jumps to #1 — its description is closest');
  console.log('  to "warm beach holiday on a budget".\n');

  // ── Step 3: Show what the model actually sees ───────────────────
  console.log('═══════════════════════════════════════════════');
  console.log('  STEP 3: What the model receives (top 1)');
  console.log('═══════════════════════════════════════════════\n');

  const topResult = results2[0]!;
  console.log('  If we send only the top 1 result to the model,');
  console.log('  this is ALL it knows about:\n');
  console.log(`    Name: ${topResult.name}`);
  console.log(`    Description: ${topResult.description}`);
  console.log(`    Score: ${topResult.similarity.toFixed(3)}\n`);
  console.log('  The model cannot recommend Tokyo or Reykjavik');
  console.log('  because they were not in the context it received.');
  console.log('  That is the power (and the limit) of RAG:');
  console.log('  you control what the model can see.\n');

  console.log('═══════════════════════════════════════════════');
  console.log('  KEY TAKEAWAYS');
  console.log('═══════════════════════════════════════════════');
  console.log('  1. Embeddings turn text into numbers so we');
  console.log('     can measure "how similar are these?"');
  console.log('  2. Adding better data changes what ranks first');
  console.log('  3. The top-K cutoff decides what the model sees');
  console.log('  4. RAG = search your data, feed results to model');
  console.log('═══════════════════════════════════════════════\n');

  console.log('  Now try the main challenge: npm run q3\n');
}

main().catch(console.error);
