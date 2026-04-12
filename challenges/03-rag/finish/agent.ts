// Challenge 3: Agent + RAG
// The agent can now search your destination database for grounded recommendations

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { model } from '../../../shared/model.ts';
import { searchDestinations as searchDb } from '../../../shared/search-destinations.ts';
import { destinations } from '../../../shared/data/destinations.ts';

import {init} from 'autotel';

init({
  service: '03-rag',
  version: '1.0.0',
  environment: 'development',
  debug: true,
});

const destinationCityMap: Record<string, string> = {
  'Tokyo, Japan': 'Tokyo',
  'Bali, Indonesia': 'Bali',
  'Paris, France': 'Paris',
  'Queenstown, New Zealand': 'Queenstown',
  'Marrakech, Morocco': 'Marrakech',
  Maldives: 'Maldives',
  'Reykjavik, Iceland': 'Reykjavik',
  'Lisbon, Portugal': 'Lisbon',
  'Patagonia, Argentina/Chile': 'Patagonia',
  'Kyoto, Japan': 'Kyoto',
  'Cancún, Mexico': 'Cancun',
  'Swiss Alps, Switzerland': 'Swiss Alps',
  'Bangkok, Thailand': 'Bangkok',
  'Santorini, Greece': 'Santorini',
  Vietnam: 'Hoi An',
  'Rome, Italy': 'Rome',
  'Barcelona, Spain': 'Barcelona',
  'Amsterdam, Netherlands': 'Amsterdam',
  'Cape Town, South Africa': 'Cape Town',
  'Dubrovnik, Croatia': 'Dubrovnik',
  'Prague, Czech Republic': 'Prague',
  'New York, USA': 'New York',
  'Sydney, Australia': 'Sydney',
  'Edinburgh, Scotland': 'Edinburgh',
  'Istanbul, Turkey': 'Istanbul',
  'London, UK': 'London',
  'Seville, Spain': 'Seville',
  'Porto, Portugal': 'Porto',
  'Norwegian Fjords, Norway': 'Bergen',
  'Costa Rica': 'San Jose',
};

function getRouteSeed(from: string, to: string, date: string): number {
  return `${from}-${to}-${date}`
    .toLowerCase()
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
}

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
      cancun: { temp: 29, condition: 'warm and breezy' },
      bangkok: { temp: 33, condition: 'hot and humid' },
      santorini: { temp: 26, condition: 'sunny with sea breeze' },
      'hoi an': { temp: 31, condition: 'hot and sunny' },
      marrakech: { temp: 28, condition: 'hot and dry' },
      queenstown: { temp: 16, condition: 'cool and clear' },
      maldives: { temp: 31, condition: 'tropical and sunny' },
      'cape town': { temp: 23, condition: 'sunny with coastal breeze' },
      'san jose': { temp: 27, condition: 'warm with scattered showers' },
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
    date: z.string().optional().describe('Travel date (approximate). If omitted, assume next month.'),
  }),
  execute: async ({ from, to, date }) => {
    const travelDate = date ?? 'next month';
    const basePrice = 180 + (getRouteSeed(from, to, travelDate) % 260);
    return {
      from, to, date: travelDate,
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
      lisbon: ['Ride Tram 28 through Alfama', 'Try pastéis de nata in Belém', 'Take a day trip to Cascais beaches', 'Watch sunset from a miradouro'],
      cancun: ['Relax on Playa Delfines', 'Swim in a cenote', 'Visit nearby Tulum ruins', 'Snorkel along the reef'],
      bangkok: ['Visit Wat Pho and the Grand Palace', 'Take a longtail boat through the canals', 'Eat street food in Yaowarat', 'Enjoy a rooftop sunset'],
      santorini: ['Watch sunset in Oia', 'Relax on Perissa Beach', 'Take a caldera boat trip', 'Visit cliffside villages'],
      'hoi an': ['Relax at An Bang Beach', 'Explore the lantern-lit old town', 'Cycle through rice paddies', 'Take a cooking class'],
      maldives: ['Snorkel over coral reefs', 'Take a sunset boat cruise', 'Relax on a white-sand beach', 'Visit a local island'],
      marrakech: ['Explore the medina souks', 'Visit Bahia Palace', 'Take a day trip to the Atlas foothills', 'Try tagine in Jemaa el-Fnaa'],
      'cape town': ['Ride the cable car up Table Mountain', 'Visit Camps Bay beach', 'Explore the V&A Waterfront', 'Take a Cape Peninsula drive'],
    };
    return { city, activities: activities[city.toLowerCase()] || ['Explore the city centre', 'Visit local markets', 'Try the local cuisine'] };
  },
});

const searchDestinations = tool({
  description: 'Search the destination database for places matching a travel query. Use this when the user asks for destination recommendations or "where should I go?"',
  inputSchema: z.object({
    query: z.string().describe('What the user is looking for, e.g. "warm beach on a budget"'),
  }),
  execute: async ({ query }) => {
    const queryLower = query.toLowerCase();
    const wantsBeach = queryLower.includes('beach');
    const wantsBudget = queryLower.includes('budget') || queryLower.includes('cheap') || queryLower.includes('affordable');
    const wantsWarm = queryLower.includes('warm') || queryLower.includes('hot') || queryLower.includes('sun');

    const results = await searchDb(query, 8);

    return results
      .map((r) => {
        const meta = destinations.find((d) => d.name === r.name);
        const haystack = [
          r.name,
          r.description,
          meta?.climate ?? '',
          meta?.type ?? '',
          r.budget,
        ].join(' ').toLowerCase();

        let score = r.similarity;
        if (wantsBeach && meta?.type === 'beach') score += 0.35;
        if (wantsBudget && r.budget === 'budget') score += 0.3;
        if (wantsWarm && /(warm|hot|tropical|mediterranean|sunny|humid)/.test(haystack)) score += 0.2;
        if (wantsBeach && !haystack.includes('beach')) score -= 0.1;
        if (wantsBudget && r.budget === 'luxury') score -= 0.2;

        return {
          name: r.name,
          city: destinationCityMap[r.name] ?? r.name.split(',')[0]!,
          description: r.description,
          budget: r.budget,
          type: meta?.type ?? 'unknown',
          climate: meta?.climate ?? 'unknown',
          relevance: score.toFixed(3),
        };
      })
      .sort((a, b) => Number(b.relevance) - Number(a.relevance))
      .slice(0, 1);
  },
});

const tripPlannerAgent = new ToolLoopAgent({
  model,
  instructions: `You are TripMate, a helpful travel planning assistant with access to a curated destination database.
When asked for destination recommendations, use the searchDestinations tool to find matching places from your database.
Only recommend destinations returned by searchDestinations. Do not invent substitute cities or fallback destinations that were not returned.
When searchDestinations returns a city field, use that exact city value for getWeather, getActivities, and searchFlights.
Preserve any explicit user constraints exactly, including departure city. If the user says "from London", use London as the flight origin.
Never claim a tool failed unless you actually saw a tool error in the tool results.
Prefer the highest-relevance destination that matches the user's constraints such as beach, budget, or warm weather.
Do not convert currencies unless you call convertCurrency. If a flight tool returns USD, present it as USD.
When planning a trip, use your tools to gather all the information needed:
- Search destinations for recommendations
- Check the weather at the destination
- Search for flights
- Convert prices to the requested currency
- Find activities to do
Then provide a comprehensive, grounded recommendation.`,
  tools: {
    getWeather,
    searchFlights,
    convertCurrency,
    getActivities,
    searchDestinations,
  },
  stopWhen: stepCountIs(10),
  experimental_telemetry: { isEnabled: true },
});

async function main() {
  console.log('🧳 TripMate Agent — Finding the perfect destination...\n');

  const result = await tripPlannerAgent.generate({
    prompt: 'Where should I go for a warm beach holiday on a budget? Search for destinations, choose one of the returned options only, then check the weather and find flights from London for that exact destination.',
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
