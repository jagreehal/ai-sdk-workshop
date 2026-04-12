// Challenge 4: TripMate UI — Vite Plugin (server plumbing)
// You do NOT need to edit this file.
// Edit ai-tools.ts to define your tools and system prompt.

import { Plugin } from 'vite';
import { createOllama } from 'ai-sdk-ollama';
import { streamText, convertToModelMessages, wrapLanguageModel, stepCountIs } from 'ai';
import { devToolsMiddleware } from '@ai-sdk/devtools';
import { init } from 'autotel';

const toolsPath = process.env.SOLUTION === '1' ? './ai-tools.finish.ts' : './ai-tools.ts';
const { tools, systemPrompt } = await import(toolsPath);

init({
  service: '04-ui',
  version: '1.0.0',
  environment: 'development',
  debug: true,
});

export function apiPlugin(): Plugin {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { messages } = JSON.parse(body);

            const ollama = createOllama({
              baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
            });
            const baseModel = ollama('granite4:latest');
            const model =
              process.env.NODE_ENV === 'production' || process.env.AI_SDK_DEVTOOLS === '0'
                ? baseModel
                : wrapLanguageModel({ model: baseModel, middleware: devToolsMiddleware() });

            const modelMessages = await convertToModelMessages(messages);

            const result = await streamText({
              stopWhen: stepCountIs(20),
              experimental_telemetry: { isEnabled: true },
              model,
              messages: modelMessages,
              tools,
              system: systemPrompt,
            });

            const response = result.toUIMessageStreamResponse();
            res.writeHead(response.status, Object.fromEntries(response.headers.entries()));

            if (response.body) {
              const reader = response.body.getReader();
              const pump = async (): Promise<void> => {
                const { done, value } = await reader.read();
                if (done) { res.end(); return; }
                res.write(value);
                return pump();
              };
              await pump();
            } else {
              res.end();
            }
          } catch (error) {
            console.error('Chat API error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      });
    },
  };
}
