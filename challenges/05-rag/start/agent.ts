// Challenge 3: Agent + RAG
// Goal: Give the agent access to your destination database
//
// RAG (Retrieval-Augmented Generation) = searching your own data and giving
// the results to the model. In practice, RAG is just another tool — the agent
// decides when to search.
//
// A pre-built helper at shared/search-destinations.ts handles the embedding
// and similarity search. You do NOT need to implement embeddings yourself.
// You just need to wrap the helper as a tool the model can call.

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { model } from '../../../shared/model.ts';
// TODO 1: Import the search helper.
// This gives your tool access to the destination search function.
// import { searchDestinations as searchDb } from '../../../shared/search-destinations.ts';

// --- Tools from Challenge 2 (pre-built) ---

const getWeather = tool({
  description: 'Get the current weather for a city',
  inputSchema: z.object({ city: z.string().describe('The city name') }),
  execute: async ({ city }) => {
    const data: Record<string, { temp: number; condition: string }> = {
      london: { temp: 12, condition: 'rainy' },
      tokyo: { temp: 22, condition: 'sunny' },
      bali: { temp: 30, condition: 'tropical' },
      paris: { temp: 18, condition: 'partly cloudy' },
      lisbon: { temp: 24, condition: 'sunny and mild' },
    };
    const weather = data[city.toLowerCase()] || { temp: 20, condition: 'mild' };
    return { city, temperature: `${weather.temp}°C`, condition: weather.condition };
  },
});

const searchFlights = tool({
  description: 'Search for flights between two cities',
  inputSchema: z.object({
    from: z.string().describe('Departure city'),
    to: z.string().describe('Destination city'),
    date: z.string().describe('Travel date (approximate)'),
  }),
  execute: async ({ from, to, date }) => {
    const routeSeed = `${from}-${to}-${date}`
      .toLowerCase()
      .split('')
      .reduce((total, char) => total + char.charCodeAt(0), 0);
    const basePrice = 180 + (routeSeed % 260);
    return {
      from, to, date,
      flights: [
        { airline: 'SkyWing', price: basePrice, currency: 'USD', duration: '11h 30m' },
        { airline: 'AeroConnect', price: basePrice + 80, currency: 'USD', duration: '12h 15m' },
      ],
    };
  },
});

const convertCurrency = tool({
  description: 'Convert an amount from one currency to another',
  inputSchema: z.object({
    amount: z.coerce.number().describe('Amount to convert'),
    from: z.string().describe('Source currency code (e.g., USD)'),
    to: z.string().describe('Target currency code (e.g., GBP)'),
  }),
  execute: async ({ amount, from, to }) => {
    const rates: Record<string, number> = {
      'USD-GBP': 0.79, 'USD-EUR': 0.92, 'USD-JPY': 149.5,
      'GBP-USD': 1.27, 'GBP-EUR': 1.16, 'EUR-USD': 1.09,
    };
    const rate = rates[`${from}-${to}`] || 1;
    return { original: `${amount} ${from}`, converted: `${(amount * rate).toFixed(2)} ${to}`, rate };
  },
});

const getActivities = tool({
  description: 'Get popular activities and things to do in a city',
  inputSchema: z.object({ city: z.string().describe('The city to get activities for') }),
  execute: async ({ city }) => {
    const activities: Record<string, string[]> = {
      tokyo: ['Visit Senso-ji Temple', 'Explore Shibuya Crossing', 'Try ramen in Shinjuku', 'See cherry blossoms in Ueno Park'],
      london: ['Visit the British Museum', 'Walk along the South Bank', 'Explore Camden Market', 'See a West End show'],
      bali: ['Visit Uluwatu Temple', 'Surf at Kuta Beach', 'Explore rice terraces in Ubud', 'Watch a Kecak fire dance'],
    };
    return { city, activities: activities[city.toLowerCase()] || ['Explore the city centre', 'Visit local markets', 'Try the local cuisine'] };
  },
});

// --- TODO 2: Define the searchDestinations tool ---
// This tool answers: "Which destinations best match the user's request?"
// Keep the output compact and structured so the model can reason over it.
//
// description: 'Search the destination database for places matching a travel query.
//               Use this when the user asks for destination recommendations.'
// inputSchema: { query: string }
// execute: call searchDb(query, 3) and return the results
//          map results to { name, description, budget, relevance: similarity.toFixed(3) }
//
// const searchDestinations = tool({ ... })

// --- Agent ---
const tripPlannerAgent = new ToolLoopAgent({
  model,
  // TODO 3: Update the instructions to mention the destination database.
  // If the model never calls searchDestinations, the instructions are usually too weak.
  instructions: `You are TripMate, a helpful travel planning assistant.
When asked to plan a trip, use your tools to gather all the information needed:
- Check the weather at the destination
- Search for flights
- Convert prices to the requested currency
- Find activities to do
Then provide a comprehensive trip summary.`,
  // TODO 4: Add searchDestinations to the tools.
  // If the tool is not in this object, the model cannot call it.
  tools: { getWeather, searchFlights, convertCurrency, getActivities },
  stopWhen: stepCountIs(10),
});

async function main() {
  console.log('🧳 TripMate Agent — Finding the perfect destination...\n');

  // On the first run, the helper may take ~30-60 seconds to embed the destinations.
  // That pause is expected.
  const result = await tripPlannerAgent.generate({
    prompt: 'Where should I go for a warm beach holiday on a budget? Search for destinations, then check the weather and find flights from London.',
  });

  console.log(`Agent completed in ${result.steps.length} step(s):\n`);

  for (const [i, step] of result.steps.entries()) {
    console.log(`--- Step ${i + 1} ---`);
    for (const call of step.toolCalls) {
      console.log(`  Tool: ${call.toolName}(${JSON.stringify(call.input)})`);
    }
    if (step.text) {
      console.log(`  Text: ${step.text.slice(0, 100)}...`);
    }
  }

  console.log('\n✨ Final Response:\n', result.text);
}

main().catch(console.error);
