// Challenge 4: TripMate AI Tools
// Goal: Define the tools and system prompt for TripMate's streaming chat UI
//
// This is the ONLY file you need to edit for this challenge.
// The Vite plugin (vite-api-plugin.ts) handles the server plumbing —
// it imports the tools and system prompt you export here.
//
// KEY CONCEPT: These are the same tools from Challenges 1-3, but adapted for the UI.
// The tool definitions use the AI SDK's `tool()` helper with Zod schemas.
//
// What to export:
//   - tools: an object mapping tool names to tool definitions
//   - systemPrompt: a string telling the model about its capabilities

import { tool } from 'ai';
import { z } from 'zod';

// --- TODO 1: Define your 5 tools ---
// Copy the tool definitions from your Challenge 3 solution:
//   getWeather, searchFlights, convertCurrency, getActivities, searchDestinations
//
// For searchDestinations in the UI, use a simple keyword search instead of embeddings:
//   import { destinations, activities } from './src/data';
//   split the query into keywords, score matches, and return the top 3 destinations
//   bonus: normalize accents so "Cancun" still matches "Cancún"
//
// For getActivities in the UI, accept a natural-language city name and map it to the local
// destination/activity data instead of forcing the model to know your internal IDs.
//
// Tip: keep the tool outputs structured and compact. The model reads these results as context.

// --- TODO 2: Export your tools as a named object ---
// Example: export const tools = { getWeather, searchFlights, ... }
export const tools = {};

// --- TODO 3: Export a system prompt ---
// Tell TripMate about its capabilities and how to format responses.
export const systemPrompt = '';
