# 06 - TripMate UI

> **Prerequisite:** Complete challenges 01-05 (01-hello through 05-rag) first. You need your working agent with all 5 tools from challenge 05.

Your agent runs in a real streaming chat UI.

> No React knowledge needed. The UI is pre-built. You only edit one file: `ai-tools.ts`. The Vite plugin (`vite-api-plugin.ts`) handles all the server plumbing and imports your tools automatically. This challenge is about wiring your tools from Challenge 05 into a streaming endpoint.

## Key concept

In Challenges 2-4 you used `ToolLoopAgent` to run the agent loop. Here you use `streamText` from `ai` instead -- it's the streaming equivalent. Same agent loop (LLM calls tools, sees results, writes a response), but tokens stream to the browser as they're generated.

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

If you understand Challenges 02-05, this challenge is mostly about packaging the same agent pattern for a UI.

## Your tasks

Open `challenges/06-ui/ai-tools.ts` and complete the 3 TODOs:

### TODO 1: Define your 5 tools

Copy the tool definitions from your Challenge 4 solution:
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

```bash
# Run your solution for this challenge
npm run ui

# Run the reference solution (if you get stuck)
npm run solution:ui
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

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

DevTools shows your streaming agent runs in real-time. You can watch tool calls fire while the response streams back to the browser.

### How to use it

In **one terminal**, start the DevTools viewer:

```bash
npm run devtools
```

In **another terminal**, start the UI:

```bash
npm run ui
```

Then:

1. Open your chat UI at [http://localhost:3000](http://localhost:3000)
2. Open DevTools at [http://localhost:4983](http://localhost:4983)
3. Type a prompt in the chat and hit send
4. Watch DevTools in real-time as your agent runs

### What you should see

- Tool calls appearing as the agent runs (not waiting for the full response)
- Streamed tokens in the DevTools output
- Each tool call followed by its result

### Debugging: "Chat loads but tools don't fire"

**First, check the browser console:**

1. Open your browser's DevTools (F12 or Cmd+Shift+I)
2. Go to **Console** tab
3. Any errors? (Parsing errors, missing exports, etc.)
4. Type a prompt and watch for error messages

**Then, check AI SDK DevTools:**

1. Send a prompt in the chat
2. Go to [http://localhost:4983](http://localhost:4983)
3. Look at the run — do you see `generateText` or `streamText` being called?
4. Check the steps — are there `toolUse` objects?

**If tools appear in AI SDK DevTools but not in chat:**
- Check browser console for streaming errors
- The tools are being called — the display isn't updating correctly

**If tools don't appear in either place:**
1. Check your `ai-tools.ts` exports
2. Did you export `const tools = { ... }` and `const systemPrompt = ...`?
3. Did you update your system prompt to mention the tools?

### Browser Network Tab

For streaming-specific debugging:

1. Open browser DevTools → **Network** tab
2. Send a prompt
3. Click the `/api/chat` request
4. Look at the **Response** tab — you should see the streamed chunks coming in
5. Each chunk is a JSON object with token and tool data

### Debugging: "Streaming seems slow"

1. Open AI SDK DevTools
2. Check token counts and timing
3. If reasonable (normal is 1-3 seconds for a full response), the backend is fine
4. If very slow (5+ seconds), check:
   - Is Ollama running? (`ollama serve` in another terminal)
   - Is your destination database loaded? (First run embeds all destinations — that's 30-60 seconds)

### Disable DevTools (optional)

```bash
AI_SDK_DEVTOOLS=0 npm run ui
```

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
