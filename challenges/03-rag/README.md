# 03 - Agent + RAG

TripMate can plan trips, but ask "Where should I go?" and it can only guess. RAG gives it your own data -- 30 curated destinations that the agent can search for grounded recommendations.

## What is RAG?

Retrieval-Augmented Generation means searching your own data and giving the results to the model as context. The model answers based on real information instead of guessing.

In practice, RAG is just another tool. The agent decides when to search, reads the results, and uses them in its response. Same `tool()` pattern you already know.

## Warm-up: see embeddings in action (5 min)

Before wiring up the full agent, run this short intro to build intuition about what embeddings do and why top-K matters:

```bash
npm run q3:intro
```

What happens:

1. **2 destinations** (Tokyo, Reykjavik) are embedded. You search for "warm beach holiday on a budget" — neither is a great match, but the model would have to pick from these.
2. **Bali is added** and the search runs again — Bali jumps to #1 because its description is closest to the query.
3. **Top-1 cutoff** — you see exactly what the model would receive. It can only recommend what's in its context.

You control what the model can see. Adding better data changes the result. The top-K cutoff decides what makes it into the model's context and what gets left out. That's RAG in a nutshell.

After running the intro, move on to the main challenge below.

---

## AI SDK primer

From the AI SDK's point of view, nothing new is happening:

- You still define a tool with `tool(...)`
- You still pass that tool to `ToolLoopAgent`
- The model still decides when to call it

The new ingredient is that the tool's `execute` function does a similarity search over embedded data instead of returning a simple mock value.

That is why RAG is best understood as "retrieval inside the same tool loop", not as a separate architecture.

```
┌──────────────────────────────────────────────┐
│             Agent Loop + RAG                 │
│                                              │
│   "Where should I go?"                       │
│        │                                     │
│        ▼                                     │
│   LLM decides: searchDestinations            │
│        │                                     │
│        ▼                                     │
│   Embed query ──▸ Compare to 30 destinations │
│        │                                     │
│        ▼                                     │
│   Top 3 results returned to LLM             │
│        │                                     │
│        ▼                                     │
│   LLM uses results + other tools ──▸ Answer  │
└──────────────────────────────────────────────┘
```

## The pre-built helper

`shared/search-destinations.ts` handles the hard part - embedding all 30 destinations and running similarity search. You just need to wrap it as a tool.

```typescript
// What the helper gives you:
import { searchDestinations } from '../../../shared/search-destinations.ts';

const results = await searchDestinations('warm beach on a budget', 3);
// Returns: [{ name, description, budget, similarity }, ...]
```

The first run takes ~30-60 seconds to embed all destinations. After that, embeddings are cached in memory.

You do not need to implement embeddings yourself. The workshop already built that part. Your job is to expose it to the model as an AI SDK tool.

## Steps to complete

Open `start/agent.ts` and work through four TODOs:

1. **TODO 1** - Uncomment the import for `searchDestinations` from `shared/search-destinations.ts`
2. **TODO 2** - Define a `searchDestinations` tool using `tool()` with a description, a Zod schema for `query`, and an execute function that calls `searchDb(query, 3)` and maps the results
3. **TODO 3** - Update the agent instructions to mention the destination database ("use the searchDestinations tool to find matching places")
4. **TODO 4** - Add `searchDestinations` to the tools object

## How to think about the TODOs

This challenge has two layers:

1. Retrieval layer: search the destination database and return the best matches
2. Agent layer: teach the model when to use retrieval and how to combine those results with the other tools

If the agent never calls the retrieval tool, the problem is usually not the embeddings. It is usually the tool description, the instructions, or the fact that the tool was not wired in.

## Suggested pace

- 3 min: read the helper and understand what it returns
- 5 min: wrap it in a tool
- 3 min: update instructions and wiring
- 5 min: run and inspect the retrieval step

If you're facilitating, tell the room ahead of time that the first run can pause for 30-60 seconds while embeddings are created.

## Run it

```bash
# Run your solution
npm run q3

# Run the reference solution
npm run solution:q3
```

## DevTools

> **Note:** AI SDK DevTools is experimental and intended for local development only. Do not use in production environments.

This challenge uses [AI SDK DevTools](https://ai-sdk.dev/docs/ai-sdk-core/devtools). You can inspect RAG tool calls, embeddings, and multi-step runs in a web UI. The shared model is wrapped with DevTools middleware when not in production.

- **Launch the viewer:** In another terminal run `npx @ai-sdk/devtools`, then open [http://localhost:4983](http://localhost:4983).
- **Disable DevTools:** Set `AI_SDK_DEVTOOLS=0` when running the agent.

## Expected output

You should see something like this (exact text will vary):

```
🧳 TripMate Agent - Finding the perfect destination...

📦 Embedding destinations (first run only)...
✅ Embedded 30 destinations.

Agent completed in 4 step(s):

--- Step 1 ---
  Tool: searchDestinations({"query":"warm beach holiday on a budget"})
--- Step 2 ---
  Tool: getWeather({"city":"Bali"})
  Tool: searchFlights({"from":"London","to":"Bali","date":"next month"})
--- Step 3 ---
  Tool: getActivities({"city":"Bali"})
--- Step 4 ---
  Text: Based on searching our destination database, I found some great...

✨ Final Response:
 Based on your request for a warm beach holiday on a budget, I searched
 our destination database and found these top matches:
 ...
```

Notice how `searchDestinations` is called first, then the agent uses the results to decide which destination to check weather and flights for.

The embedding step only happens once. If you see "Embedding destinations..." it means the helper is generating embeddings for all 30 destinations. This takes 30-60 seconds. Subsequent runs reuse the cache.

That first-run pause is expected. Tell participants not to assume the program is hung just because it takes longer the first time.

## Checkpoint

You are on track if:

- the first step is a `searchDestinations` call
- the returned results include plausible destinations
- later steps use one of those destinations for weather, flights, or activities

If the model skips retrieval entirely, focus on the tool description and instructions before investigating the embedding code.

## Hints

Try to solve it yourself first! If you get stuck, open these one at a time.

<details>
<summary>Hint 1: Import and tool definition</summary>

```typescript
// Uncomment the import:
import { searchDestinations as searchDb } from '../../../shared/search-destinations.ts';

// Define the tool:
const searchDestinations = tool({
  description: 'Search the destination database for places matching a travel query. Use this when the user asks for destination recommendations or "where should I go?"',
  inputSchema: z.object({
    query: z.string().describe('What the user is looking for, e.g. "warm beach on a budget"'),
  }),
  execute: async ({ query }) => {
    const results = await searchDb(query, 3);
    return results.map(r => ({
      name: r.name,
      description: r.description,
      budget: r.budget,
      relevance: r.similarity.toFixed(3),
    }));
  },
});
```

The `description` is critical - it tells the model when to use this tool. Mentioning "destination recommendations" and "where should I go?" helps the model match it to the right queries.
</details>

<details>
<summary>Hint 2: Updated instructions</summary>

```typescript
instructions: `You are TripMate, a helpful travel planning assistant with access to a curated destination database.
When asked for destination recommendations, use the searchDestinations tool to find matching places from your database.
When planning a trip, use your tools to gather all the information needed:
- Search destinations for recommendations
- Check the weather at the destination
- Search for flights
- Convert prices to the requested currency
- Find activities to do
Then provide a comprehensive, grounded recommendation.`,
```

The key addition is telling the agent about the destination database and when to use it.
</details>

<details>
<summary>Hint 3: Wiring the tool</summary>

```typescript
tools: { getWeather, searchFlights, convertCurrency, getActivities, searchDestinations },
```

Just add `searchDestinations` to the existing tools object. The agent will figure out when to use it based on the description and instructions.
</details>

<details>
<summary>Full solution walkthrough</summary>

Here is what's happening end to end:

1. **Import** - You bring in the `searchDestinations` helper which embeds all 30 destinations and does cosine similarity search.

2. **Tool definition** - The `searchDestinations` tool wraps the helper. When the model calls it with `{ query: "warm beach on a budget" }`, the execute function embeds the query, compares it to all destinations, and returns the top 3 matches with name, description, budget, and relevance score.

3. **Instructions** - You update the system prompt to mention the destination database. This guides the model to use `searchDestinations` when someone asks "where should I go?" instead of guessing.

4. **Wiring** - Adding the tool to the `tools` object makes it available to the agent.

The agent loop then works like this:
- User asks "Where should I go for a warm beach holiday on a budget?"
- Agent calls `searchDestinations` with the query
- Gets back top 3 matching destinations (e.g., Bali, Phuket, Cancun)
- Agent picks the best match and calls `getWeather`, `searchFlights`, etc.
- Agent writes a grounded recommendation based on real data

This is RAG in its simplest form: search your data, give it to the model, let it reason over it.
</details>

## Debugging

| Problem | Fix |
|---------|-----|
| `Cannot find module '../../../shared/search-destinations.ts'` | Make sure you're running from the repo root with `npm run q3` |
| `searchDb is not a function` | Check TODO 1 - you need to uncomment the import line |
| Agent does not call `searchDestinations` | Check TODO 3 - your instructions need to mention the destination database |
| `searchDestinations` not in tool calls | Check TODO 4 - make sure you added it to the `tools` object |
| `amount` validation error in currency conversion | Some local models emit `"350"` instead of `350` | Use `z.coerce.number()` in `convertCurrency` |
| Embedding step takes a long time | Normal on first run (30-60s). Subsequent runs are instant |
| Ollama connection error | Run `ollama serve` in another terminal, then `ollama pull granite4:latest` |

## How to debug

Debug retrieval in this order:

1. Does the import for `searchDb` exist?
2. Does the retrieval tool call `searchDb(query, 3)`?
3. Are the agent instructions explicit about destination recommendations?
4. Is `searchDestinations` included in `tools`?
5. After the retrieval step, does the model have enough structured data to continue planning?

If the search results look odd, remember that the model is only as grounded as the returned context. The retrieval result format matters.

## If you're stuck

Use this escalation path:

1. Confirm the import is uncommented correctly
2. Confirm the tool calls `searchDb(query, 3)`
3. Confirm the instructions explicitly mention destination recommendations
4. Confirm the tool is added to `tools`
5. Then compare with `finish/agent.ts`

## Success criteria

You're done when the agent searches your destination database and gives a grounded recommendation -- one that references specific destinations from the database, not made-up places. You should see `searchDestinations` in the tool call output, followed by the agent using those results to check weather, find flights, and build a recommendation.

