// Challenge 04: Multi-Agent
// The agent autonomously decides which tools to call and in what order

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { model } from '../../../shared/model.ts';
import { getRouteSeed, weatherData, activitiesData, currencyRates } from '../../../shared/utils.ts';

const getWeather = tool({
  description: 'Get the current weather for a city',
  inputSchema: z.object({
    city: z.string().describe('The city name'),
  }),
  execute: async ({ city }) => {
    const weather = weatherData[city.toLowerCase()] || { temp: 20, condition: 'mild' };
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
    const rate = currencyRates[`${from}-${to}`] || 1;
    return { original: `${amount} ${from}`, converted: `${(amount * rate).toFixed(2)} ${to}`, rate };
  },
});

const getActivities = tool({
  description: 'Get popular activities and things to do in a city',
  inputSchema: z.object({
    city: z.string().describe('The city to get activities for'),
  }),
  execute: async ({ city }) => {
    const cityActivities = activitiesData[city.toLowerCase()] || ['Explore the city centre', 'Visit local markets', 'Try the local cuisine'];
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
