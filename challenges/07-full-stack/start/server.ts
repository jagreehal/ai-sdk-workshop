import { Hono } from 'hono';
import { createServer } from 'node:http';
import { getRequestListener } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { streamText } from 'ai';
import { model } from '../../../shared/model.ts';
import { tool } from 'ai';
import { z } from 'zod';

// TODO 1: Import your tools from challenge 05
// You'll need: getWeather, searchFlights, convertCurrency, getActivities, searchDestinations
// Copy the tool definitions from /challenges/05-rag/finish/agent.ts

const app = new Hono();

// Serve static files (HTML, CSS, JS from index.html)
app.use('/', serveStatic({ root: './challenges/05-ui-simple/start', path: 'index.html' }));

// TODO 2: Create the /api/chat endpoint
// This endpoint should:
// 1. Accept a POST request with { message: string }
// 2. Use streamText() with your agent (model + tools + system prompt)
// 3. Return the response using toUIMessageStreamResponse() for proper streaming format
//
// Pattern:
// app.post('/api/chat', async (c) => {
//   const { message } = await c.req.json();
//   try {
//     const aiStream = streamText({
//       model,
//       system: 'You are TripMate, a helpful travel planning assistant...',
//       prompt: message,
//       tools: {
//         getWeather,
//         searchFlights,
//         convertCurrency,
//         getActivities,
//         searchDestinations,
//       },
//     });
//     return aiStream.toUIMessageStreamResponse();
//   } catch (error) {
//     console.error('Error:', error);
//     return c.text(`Error: ${error}`, 500);
//   }
// });

// TODO 3 (optional): Use shared agent configuration
// Once you get it working, consider importing tools from shared/trip-agent.ts
// to avoid duplicating tool definitions across files.

const port = 3000;
const server = createServer(getRequestListener(app.fetch));
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log('Open the browser and start chatting with TripMate!');
});
