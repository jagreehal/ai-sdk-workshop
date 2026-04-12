# 04 - TripMate UI

Your agent runs in a real streaming chat UI.

> No React knowledge needed. The UI is pre-built. You only edit one file: `ai-tools.ts`. The Vite plugin (`vite-api-plugin.ts`) handles all the server plumbing and imports your tools automatically. This challenge is about wiring your tools into a streaming endpoint -- the same work you did in Challenges 1-3, just with `streamText` instead of `ToolLoopAgent`.

## Key concept

In Challenges 1-3 you used `ToolLoopAgent` to run the agent loop. Here you use `streamText` from `ai` instead -- it's the streaming equivalent. Same agent loop (LLM calls tools, sees results, writes a response), but tokens stream to the browser as they're generated.

The frontend is pre-built using [AI SDK Elements](https://elements.ai-sdk.dev) - pre-made chat components (`Conversation`, `Message`, `Response`, `PromptInput`, `Tool`) so you don't have to write UI code. You just need to add your tool definitions and system prompt to `ai-tools.ts`.

> **Note:** `searchDestinations` uses keyword search here instead of embeddings. The embedding model is not available in the Vite server context, so use a lightweight keyword scorer over the local `destinations` data.

## AI SDK primer

Different AI SDK entry point, same mental model:

- `streamText(...)` replaces `ToolLoopAgent.generate(...)`
- `tools: { ... }` still exposes model-callable tools
- `system: '...'` still gives the model instructions
- The model still decides when to call tools

The extra pieces are only there because this challenge is connected to a browser:

- `convertToModelMessages(messages)` adapts UI chat messages into model messages
- `toUIMessageStreamResponse()` turns the streamed result into an HTTP response the frontend can read

If you understand Challenges 1-3, this challenge is mostly about packaging the same agent pattern for a UI.

## Your tasks

Open `challenges/04-ui/ai-tools.ts` and complete the 3 TODOs:

### TODO 1: Define your 5 tools

Copy the tool definitions from your Challenge 3 solution:
- `getWeather` - weather lookup by city
- `searchFlights` - flight search between cities
- `convertCurrency` - currency conversion
- `getActivities` - activities for a destination, but make it accept natural-language place names rather than internal IDs
- `searchDestinations` - keyword search over the destinations database

### TODO 2: Wire tools into the `tools` object

Export your tools as a named object:

```typescript
export const tools = { getWeather, searchFlights, convertCurrency, getActivities, searchDestinations };
```

### TODO 3: Add a system prompt

Tell the model what it is and what tools it has available.

```typescript
export const systemPrompt = 'You are TripMate...';
```

## How the files fit together

```
ai-tools.ts              ← YOU EDIT THIS (tools + system prompt)
    │
    ▼
vite-api-plugin.ts       ← Server plumbing (do not edit)
    │                    imports tools/systemPrompt from ai-tools.ts
    │                    runs streamText with those tools
    ▼
vite.config.ts           ← Wires the plugin into Vite
```

The plugin is ~70 lines of boilerplate: it parses the incoming chat request, calls `streamText` with your tools, and streams the response back. You never need to touch it.

## Suggested pace

- 3 min: scan `ai-tools.ts` and identify the three export zones
- 8 min: define the tools
- 2 min: wire `export const tools = { ... }`
- 2 min: add the `systemPrompt`
- 5 min: run the UI and test prompts

If you're facilitating, keep the room focused on `ai-tools.ts`. The React UI and Vite plugin are intentionally pre-built so the learning stays on the AI SDK concepts.

## Run it

From the repo root:

```bash
npm run ui
```

To compare against the completed reference:

```bash
npm run solution:ui
```

Then open [http://localhost:3000](http://localhost:3000).

Try clicking a destination in the sidebar to send a pre-built question.

For new learners, that sidebar is useful because it gives you prompts that are likely to exercise the right tool paths.

## Checkpoint

You are on track if:

- the UI loads
- prompts stream back instead of waiting for one final block
- tool calls appear during the run
- questions about destinations, weather, and activities all trigger relevant tool usage

## DevTools

> **Note:** AI SDK DevTools is experimental and intended for local development only. Do not use in production environments.

The chat API uses [AI SDK DevTools](https://ai-sdk.dev/docs/ai-sdk-core/devtools). You can inspect streaming runs, tool calls, and steps in a web UI.

- **Launch the viewer:** In another terminal run `npx @ai-sdk/devtools`, then open [http://localhost:4983](http://localhost:4983).
- **Disable DevTools:** Set `AI_SDK_DEVTOOLS=0` when starting the UI (e.g. `AI_SDK_DEVTOOLS=0 npm run ui`).

## Hints

<details>
<summary>Hint: searchDestinations without embeddings</summary>

Use a lightweight keyword scorer over the destinations array so partial matches still work:

```typescript
const searchDestinations = tool({
  description: 'Search destinations matching a travel query',
  inputSchema: z.object({
    query: z.string().describe('Search query'),
  }),
  execute: async ({ query }) => {
    const keywords = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const ranked = destinations
      .map(destination => {
        const haystack = [
          destination.name,
          destination.description,
          destination.budget,
          destination.climate,
          destination.type,
        ].join(' ').toLowerCase();
        const score = keywords.reduce((total, keyword) => total + (haystack.includes(keyword) ? 1 : 0), 0);
        return { destination, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return ranked.some(result => result.score > 0)
      ? ranked.map(({ destination }) => ({
          name: destination.name,
          description: destination.description,
          budget: destination.budget,
        }))
      : destinations.slice(0, 3).map(destination => ({
          name: destination.name,
          description: destination.description,
          budget: destination.budget,
        }));
  },
});
```

For `getActivities`, prefer a schema like `z.object({ city: z.string() })` and normalize the value inside `execute` so the model can send `"Tokyo"` instead of an internal destination ID.

</details>

<details>
<summary>Hint: System prompt</summary>

```typescript
export const systemPrompt = `You are TripMate, a friendly travel planning assistant. You have tools to look up destinations, weather, flights, activities, and currency conversions - use them freely to gather facts before answering. Never mention tool names in your responses. Keep answers structured, practical, and concise.`;
```

</details>

## How to debug

If the UI starts but the chat does not behave correctly, debug in this order:

1. Did you define all five tools?
2. Did you export them as `export const tools = { ... }`?
3. Did you export a useful `systemPrompt`?
4. Does each tool return structured data the model can read easily?
5. Is Ollama running and reachable?

If the frontend loads but tool calls never happen, the problem is usually in `ai-tools.ts` - check your tool exports and system prompt.

## If you're stuck

Use this escalation path:

1. Make sure the server starts with `npm run ui`
2. Verify the tool definitions exist in `ai-tools.ts`
3. Verify those tools are in the `export const tools = { ... }` object
4. Verify the `systemPrompt` clearly tells the model to use them
5. Then compare with `ai-tools.finish.ts`

## Success criteria

Chat works with tools firing in real time. You can ask about weather, flights, activities, currency conversion, and destination recommendations, and see the model call tools while the response streams back.
