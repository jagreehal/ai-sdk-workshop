// Challenge 2: Multi-Tool Agent
// The agent autonomously decides which tools to call and in what order

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { model } from '../../../shared/model.ts';
import {init} from 'autotel';

init({
  service: '02-multi-agent',
  version: '1.0.0',
  environment: 'development',
  debug: true,
});

function getRouteSeed(from: string, to: string, date: string): number {
  return `${from}-${to}-${date}`
    .toLowerCase()
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
}

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

const searchFlights = tool({
  description: 'Search for flights between two cities',
  inputSchema: z.object({
    from: z.string().describe('Departure city'),
    to: z.string().describe('Destination city'),
    date: z.string().describe('Travel date (approximate)'),
  }),
  execute: async ({ from, to, date }) => {
    const basePrice = 180 + (getRouteSeed(from, to, date) % 260);
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
  inputSchema: z.object({
    city: z.string().describe('The city to get activities for'),
  }),
  execute: async ({ city }) => {
    const activities: Record<string, string[]> = {
      tokyo: ['Visit Senso-ji Temple', 'Explore Shibuya Crossing', 'Try ramen in Shinjuku', 'See cherry blossoms in Ueno Park'],
      london: ['Visit the British Museum', 'Walk along the South Bank', 'Explore Camden Market', 'See a West End show'],
      bali: ['Visit Uluwatu Temple', 'Surf at Kuta Beach', 'Explore rice terraces in Ubud', 'Watch a Kecak fire dance'],
    };
    const cityActivities = activities[city.toLowerCase()] || ['Explore the city centre', 'Visit local markets', 'Try the local cuisine'];
    return { city, activities: cityActivities };
  },
});

const tripPlannerAgent = new ToolLoopAgent({
  model,
  instructions: `You are TripMate, a helpful travel planning assistant.
When asked to plan a trip, use your tools to gather all the information needed:
- Check the weather at the destination
- Search for flights
- Convert prices to the requested currency
- Find activities to do
Then provide a comprehensive trip summary.`,
  tools: { getWeather, searchFlights, convertCurrency, getActivities },
  stopWhen: stepCountIs(10),
});

async function main() {
  console.log('🧳 TripMate Agent — Planning a trip autonomously...\n');

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
