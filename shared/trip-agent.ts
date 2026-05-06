import { ToolLoopAgent, InferAgentUIMessage } from 'ai';
import { model } from './model.ts';
import { tool } from 'ai';
import { z } from 'zod';
import { searchDestinations } from './search-destinations.ts';

// System prompt for the agent
export const systemPrompt = `You are TripMate, a helpful travel planning assistant. You help users plan trips by gathering information about destinations, flights, weather, activities, and currency. Be conversational and use the tools available to provide detailed, personalized recommendations.`;

// Tool: Get weather for a city
export const getWeather = tool({
  description: 'Get the weather for a specific city',
  inputSchema: z.object({
    city: z.string().describe('The city to get weather for'),
  }),
  execute: async ({ city }) => {
    const temps: Record<string, { temp: number; condition: string }> = {
      tokyo: { temp: 22, condition: 'sunny' },
      london: { temp: 15, condition: 'cloudy' },
      bali: { temp: 28, condition: 'warm and tropical' },
      barcelona: { temp: 20, condition: 'pleasant' },
      paris: { temp: 16, condition: 'cool' },
      lisbon: { temp: 24, condition: 'sunny and mild' },
    };
    const weather = temps[city.toLowerCase()] || { temp: 20, condition: 'mild' };
    return {
      city,
      temperature: weather.temp,
      condition: weather.condition,
      description: `${weather.temp}°C and ${weather.condition}`,
    };
  },
});

// Tool: Search for flights
export const searchFlights = tool({
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
      from,
      to,
      date,
      flights: [
        {
          airline: 'SkyWing',
          price: basePrice,
          currency: 'USD',
          duration: '11h 30m',
        },
        {
          airline: 'AeroConnect',
          price: basePrice + 80,
          currency: 'USD',
          duration: '12h 15m',
        },
      ],
    };
  },
});

// Tool: Convert currency
export const convertCurrency = tool({
  description: 'Convert an amount from one currency to another',
  inputSchema: z.object({
    amount: z.coerce.number().describe('Amount to convert'),
    from: z.string().describe('Source currency code (e.g., USD)'),
    to: z.string().describe('Target currency code (e.g., GBP)'),
  }),
  execute: async ({ amount, from, to }) => {
    const rates: Record<string, number> = {
      'USD-GBP': 0.79,
      'USD-EUR': 0.92,
      'USD-JPY': 149.5,
      'GBP-USD': 1.27,
      'GBP-EUR': 1.16,
      'EUR-USD': 1.09,
    };
    const rate = rates[`${from}-${to}`] || 1;
    return {
      original: `${amount} ${from}`,
      converted: `${(amount * rate).toFixed(2)} ${to}`,
      rate,
    };
  },
});

// Tool: Get activities
export const getActivities = tool({
  description: 'Get popular activities and things to do in a city',
  inputSchema: z.object({
    city: z.string().describe('The city to get activities for'),
  }),
  execute: async ({ city }) => {
    const activities: Record<string, string[]> = {
      tokyo: [
        'Visit Senso-ji Temple',
        'Explore Shibuya Crossing',
        'Try ramen in Shinjuku',
        'See cherry blossoms in Ueno Park',
      ],
      london: [
        'Visit the British Museum',
        'Walk along the South Bank',
        'Explore Camden Market',
        'See a West End show',
      ],
      bali: [
        'Visit Uluwatu Temple',
        'Surf at Kuta Beach',
        'Explore rice terraces in Ubud',
        'Watch a Kecak fire dance',
      ],
      barcelona: [
        'Visit Sagrada Familia',
        'Explore Gothic Quarter',
        'Relax at Barceloneta Beach',
        'See Park Güell',
      ],
      paris: [
        'Visit the Eiffel Tower',
        'Explore the Louvre',
        'Stroll along the Seine',
        'Visit Montmartre',
      ],
    };
    const cityActivities =
      activities[city.toLowerCase()] ||
      ['Explore the city centre', 'Visit local markets', 'Try the local cuisine'];
    return { city, activities: cityActivities };
  },
});

// Tool: Search destinations (RAG)
export const searchDestinationsTool = tool({
  description:
    'Search for travel destinations based on criteria like budget, climate, or activities',
  inputSchema: z.object({
    query: z.string().describe('What you are looking for (e.g., "warm beach cheap food")'),
  }),
  execute: async ({ query }) => {
    const results = await searchDestinations(query, 3);
    return {
      query,
      results: results.map((r) => ({
        name: r.name,
        description: r.description,
        budget: r.budget,
      })),
      explanation: `Found ${results.length} destinations matching your criteria`,
    };
  },
});

// Exported tools for streaming API usage
export const tripTools = {
  getWeather,
  searchFlights,
  convertCurrency,
  getActivities,
  searchDestinations: searchDestinationsTool,
};

// Create and export the agent
export const tripAgent = new ToolLoopAgent({
  model,
  instructions: systemPrompt,
  tools: tripTools,
});

// Export type-safe UI message type for frontend integration
export type TripAgentUIMessage = InferAgentUIMessage<typeof tripAgent>;
