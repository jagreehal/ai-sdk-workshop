import { Hono } from 'hono';
import { createServer } from 'node:http';
import { getRequestListener } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { streamText } from 'ai';
import { model } from '../../../shared/model.ts';
import { tripTools, systemPrompt, type TripAgentUIMessage } from '../../../shared/trip-agent.ts';

// Export type for UI components
export type { TripAgentUIMessage };

const app = new Hono();

// Serve static files
app.use('/', serveStatic({ root: './challenges/05-ui-simple/finish', path: 'index.html' }));

// Chat endpoint
app.post('/api/chat', async (c) => {
  const { message } = await c.req.json();

  try {
    const aiStream = streamText({
      model,
      system: systemPrompt,
      prompt: message,
      tools: tripTools,
    });

    return aiStream.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return c.text(`Error: ${error}`, 500);
  }
});

const port = 3000;
const server = createServer(getRequestListener(app.fetch));
server.listen(port, () => {
  console.log(`🚀 TripMate Agent running on http://localhost:${port}`);
  console.log('Open the browser and start planning trips!');
});
