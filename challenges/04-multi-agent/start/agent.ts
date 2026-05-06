// Challenge 2: Multi-Tool Agent
// Goal: Add flights, currency, and activities tools to your agent
//
// You already know how to define tools (Challenge 1).
// Now add 3 more so the agent can plan a complete trip.
//
// Important: you are still not writing orchestration logic.
// Your job is to define capabilities clearly enough that the model can choose among them.

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { model } from '../../../shared/model.ts';

// --- getWeather (already done — from Challenge 1) ---
const getWeather = tool({
  description: 'Get the current weather for a city',
  inputSchema: z.object({
    city: z.string().describe('The city name'),
  }),
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

// --- TODO 1: Define searchFlights tool ---
// This tool answers: "What flight options are available?"
// description: 'Search for flights between two cities'
// inputSchema: { from: string, to: string, date: string }
// execute: return deterministic mock flight data with airline, price (USD), duration
// hint: derive a repeatable base price from from/to/date so everyone sees the same output
//
// const searchFlights = tool({ ... })

// --- TODO 2: Define convertCurrency tool ---
// This tool answers: "What does this price become in another currency?"
// description: 'Convert an amount from one currency to another'
// inputSchema: { amount: z.coerce.number(), from: string, to: string }
// execute: use mock exchange rates to convert
//
// const convertCurrency = tool({ ... })

// --- TODO 3: Define getActivities tool ---
// This tool answers: "What can I do there?"
// description: 'Get popular activities and things to do in a city'
// inputSchema: { city: string }
// execute: return a list of activities for the city
//
// const getActivities = tool({ ... })

// --- Agent (pre-built — just add your tools below) ---
const tripPlannerAgent = new ToolLoopAgent({
  model,
  instructions: `You are TripMate, a helpful travel planning assistant.
When asked to plan a trip, use your tools to gather all the information needed:
- Check the weather at the destination
- Search for flights
- Convert prices to the requested currency
- Find activities to do
Then provide a comprehensive trip summary.`,
  // TODO 4: Add your new tools here alongside getWeather
  tools: { getWeather },
  stopWhen: stepCountIs(10),
});

async function main() {
  console.log('🧳 TripMate Agent — Planning a trip autonomously...\n');

  // This prompt is designed to force the agent to gather several facts.
  // If your setup is correct, you should see multiple tool calls across the run.
  const result = await tripPlannerAgent.generate({
    prompt: 'Plan a weekend trip from London to Tokyo. I need flights, weather, activities to do, and convert the flight cost to GBP.',
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
