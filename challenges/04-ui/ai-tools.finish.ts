// Challenge 4: TripMate AI Tools — SOLUTION
// All 5 tools and the system prompt for the streaming chat UI

import { tool } from 'ai';
import { z } from 'zod';
import { destinations, activities } from './src/data';

function normalizeLookup(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function resolveDestinationId(value: string): string {
  const normalized = normalizeLookup(value);
  const matched = destinations.find((destination) => {
    const id = normalizeLookup(destination.id);
    const name = normalizeLookup(destination.name);
    return normalized === id || normalized === name || name.includes(normalized);
  });
  return matched?.id ?? normalized;
}

const weatherData: Record<string, { temp: number; condition: string }> = {
  london: { temp: 12, condition: 'rainy and overcast' },
  tokyo: { temp: 22, condition: 'sunny and warm' },
  paris: { temp: 18, condition: 'partly cloudy' },
  bali: { temp: 30, condition: 'hot and humid' },
  reykjavik: { temp: 2, condition: 'cold with northern lights' },
  bangkok: { temp: 33, condition: 'hot and tropical' },
  marrakech: { temp: 28, condition: 'hot and dry' },
  lisbon: { temp: 24, condition: 'sunny and mild' },
  cancun: { temp: 29, condition: 'warm and breezy' },
  santorini: { temp: 26, condition: 'sunny with sea breeze' },
};

export const getWeather = tool({
  description: 'Get the current weather for a travel destination city',
  inputSchema: z.object({
    city: z.string().describe('The city name'),
  }),
  execute: async ({ city }) => {
    const key = city.toLowerCase();
    const data = weatherData[key] || { temp: 20, condition: 'mild' };
    return { city, temperature: `${data.temp}°C`, condition: data.condition };
  },
});

export const searchFlights = tool({
  description: 'Search for flights between two cities',
  inputSchema: z.object({
    from: z.string().describe('Departure city'),
    to: z.string().describe('Destination city'),
    date: z.string().describe('Travel date (approximate)'),
  }),
  execute: async ({ from, to, date }) => {
    const routeSeed = `${from}-${to}-${date}`
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

export const convertCurrency = tool({
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
    return {
      original: `${amount} ${from}`,
      converted: `${(amount * rate).toFixed(2)} ${to}`,
      rate,
    };
  },
});

export const getActivities = tool({
  description: 'Get popular activities and things to do in a destination city or place.',
  inputSchema: z.object({
    city: z.string().describe('Destination city or place name (e.g. "Tokyo", "New York", "Cape Town")'),
  }),
  execute: async ({ city }) => {
    const destinationId = resolveDestinationId(city);
    const matched = activities.filter(a => a.destinationId === destinationId);
    if (matched.length === 0) {
      return { city, activities: ['Explore the city centre', 'Visit local markets', 'Try the local cuisine'] };
    }
    return {
      city,
      activities: matched.map(a => ({ name: a.name, cost: a.costRange, duration: a.duration })),
    };
  },
});

export const searchDestinations = tool({
  description: 'Search the destinations database for places matching a travel query. Use this when the user asks for destination recommendations or describes what kind of trip they want.',
  inputSchema: z.object({
    query: z.string().describe('What the user is looking for (e.g. "warm beach budget", "cultural city europe")'),
  }),
  execute: async ({ query }) => {
    const keywords = normalizeLookup(query)
      .split(/[^a-z0-9]+/)
      .filter(Boolean);

    const ranked = destinations
      .map((destination) => {
        const rawHaystack = [
          destination.name,
          destination.description,
          destination.budget,
          destination.climate,
          destination.type,
        ].join(' ');
        const haystack = normalizeLookup(rawHaystack);

        const score = keywords.reduce((total, keyword) => {
          if (normalizeLookup(destination.name).includes(keyword)) return total + 3;
          if (normalizeLookup(destination.type).includes(keyword)) return total + 2;
          if (normalizeLookup(destination.budget).includes(keyword)) return total + 2;
          if (haystack.includes(keyword)) return total + 1;
          return total;
        }, 0);

        return { destination, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ destination, score }) => ({
        name: destination.name,
        description: destination.description,
        budget: destination.budget,
        climate: destination.climate,
        type: destination.type,
        matchScore: score,
      }));

    return ranked.some((result) => result.matchScore > 0)
      ? ranked
      : destinations.slice(0, 3).map((destination) => ({
          name: destination.name,
          description: destination.description,
          budget: destination.budget,
          climate: destination.climate,
          type: destination.type,
          matchScore: 0,
        }));
  },
});

export const tools = { getWeather, searchFlights, convertCurrency, getActivities, searchDestinations };

export const systemPrompt = `You are TripMate, a friendly travel planning assistant.
You have access to destination, weather, flight, activity, and currency data. Gather facts before answering.

Never mention internal tool names in responses.

Write responses in clean Markdown optimized for chat rendering:
- short headings (## / ###)
- concise bullets (one line each)
- a compact table when comparing options
- bold key numbers (price, temperature, duration)

Default response structure:
1) "## Recommendation" with the top pick first
2) "## Why It Fits" with 3-5 bullets
3) "## Quick Plan" as a 2-4 item bullet list
4) "## Budget Snapshot" with concrete cost ranges
5) "## Assumptions" only when needed
6) "## Trade-offs" with 2-4 bullets
7) End with one short follow-up question

Style rules:
- be specific and practical, avoid long paragraphs
- keep total length under ~220 words unless user asks for depth
- use plain language and avoid filler`;
