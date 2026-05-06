# 04 - Multi-Tool Agent

In Challenge 03 you gave TripMate one tool: weather. Now give it flights, currency conversion, and activities.

You don't orchestrate the tools. You define them, hand them to the agent, and the LLM decides which to call and in what order. One prompt can trigger a chain of tool calls.

## Mental Model

```
User asks:
"Plan a weekend trip to Tokyo from London"

          ↓

LLM sees 4 tools available:
  • getWeather
  • searchFlights
  • convertCurrency
  • getActivities

          ↓

LLM decides autonomously:
  Step 1: Call weather, flights, activities in parallel
          (independent questions)
  Step 2: Call convertCurrency
          (needs flight price from Step 1)
  Step 3: Synthesize results → final answer

          ↓

User sees complete trip plan with:
  ✓ Weather forecast
  ✓ Flight options + prices
  ✓ Currency conversion
  ✓ Things to do
```

The key: **You design the tools. The model decides how to use them.**

## AI SDK primer

Same AI SDK pattern as Challenge 2. The only difference is the model now has more tools.

- You still define each tool with `tool(...)`
- You still pass them into `ToolLoopAgent`
- You still call `agent.generate(...)`
- The new behavior comes from the model having more choices, not from new code you write

Expanding capability means designing a better toolset, not writing nested control flow.

---

## What you're building

A travel planning agent with 4 tools that gathers everything needed for a trip on its own:

| Tool | Purpose |
|------|---------|
| `getWeather` | Check destination weather (already done) |
| `searchFlights` | Find flights between two cities |
| `convertCurrency` | Convert prices to another currency |
| `getActivities` | List things to do at the destination |

---

## Steps to complete

Open `start/agent.ts` and complete the 4 TODOs:

### TODO 1 - `searchFlights`
Define a tool that takes `from`, `to`, and `date` (all strings) and returns mock flight options with airline name, price in USD, and duration. Keep the mock pricing deterministic so everyone in the room sees the same result for the same route.

### TODO 2 - `convertCurrency`
Define a tool that takes `amount`, `from`, and `to` (currency codes) and returns the converted amount using mock exchange rates. Use `z.coerce.number()` for `amount` so the tool still works if the model sends `"350"` instead of `350`.

### TODO 3 - `getActivities`
Define a tool that takes `city` (string) and returns a list of popular activities for that city.

### TODO 4 - Wire them up
Add your three new tools to the agent's `tools` object alongside `getWeather`.

## How to think about the TODOs

Each TODO is asking you to answer one question the model cannot answer reliably on its own:

- `searchFlights`: "What flights are available?"
- `convertCurrency`: "What does this cost in the user's currency?"
- `getActivities`: "What can I do there?"

Once those capabilities exist, the model can assemble them into a useful response.

You are not coding the travel plan itself. You are coding the building blocks the model needs.

## Sequential vs Parallel Tool Calls: How agents optimize (and when NOT to)

When you give an agent multiple tools, it doesn't always call them one after another. Understanding when to use parallel vs sequential is crucial for designing efficient agents.

### The Two Patterns

**Sequential: One at a time**

```
Step 1: Call getWeather("Tokyo")
        ↓ wait for result
Step 2: Call searchFlights("London", "Tokyo")
        ↓ wait for result
Step 3: Call getActivities("Tokyo")
        ↓ wait for result
Step 4: Call convertCurrency($350, "USD" → "GBP")
        ↓ wait for result
Step 5: Generate final answer
```

Each tool must finish before the next starts. 4 tool calls = 4 waits.

**Parallel: Independent tools together**

```
Step 1: Call getWeather("Tokyo")  ──┐
        Call searchFlights(...)     ├─→ All run simultaneously
        Call getActivities(...)     ──┘
        (single wait for all results)

Step 2: Call convertCurrency (now we have the flight price)
        (single wait)

Step 3: Generate final answer
```

Same information, but faster. The agent reduced 5 steps to 3 steps. This is **automatic**—you don't code it. The model recognizes which tools are independent.

### When to Expect Parallel Calls

The model will naturally parallelize when tools are **independent**: they don't need each other's results to run.

In this challenge:
- ✅ `getWeather`, `searchFlights`, `getActivities` → **can run in parallel** (they answer different questions)
- ❌ `convertCurrency` → **must run after** `searchFlights` (it needs the flight price)

Think of it like a kitchen:
- Chopping vegetables, boiling water, and preheating the oven can happen in parallel (independent)
- You can't cook the pasta until water is boiling (dependent)

### When to Use Sequential (Intentionally)

Some designs **require** sequential calls even if you could theoretically parallelize:

**Example 1: Tool builds on previous result**
```
Step 1: Call searchFlights("London" → "Tokyo")
Step 2: Call getFlightDetails(flightId=AA123)  ← needs result from step 1
Step 3: Call reserveSeat(flightId=AA123, seat=1A)  ← needs result from step 2
```

Here, each step depends on the previous one. Parallelizing breaks the flow.

**Example 2: You want the model to reason progressively**

Sometimes you intentionally design tools to be called sequentially so the agent reasons step-by-step:

```
Step 1: Call searchDestinations("beach")  ← What's available?
Step 2: Use that result to call checkWeather(destination)  ← What's the weather there?
Step 3: Call calculateBudget(destination)  ← Can I afford it?
```

By splitting them into separate steps, you force the agent to think through each decision. This can be better for complex reasoning than dumping all tools at once.

**Example 3: Preventing hallucination**

If you have many tools, paralyzing all of them at once can confuse the model. Sequential calls keep it focused:

```
Bad (too much at once):
  Tool: search, lookup, compare, filter, rank, suggest (all parallel)
  → Model might get confused

Better (structured thinking):
  Step 1: search
  Step 2: filter (based on search results)
  Step 3: rank (based on filtered results)
```

### How Tool Design Affects Parallelization

The model decides whether to parallelize based on:

1. **Tool descriptions** — if they clearly show tools are independent, the model parallelizes
2. **Tool inputs** — if one tool needs output from another, sequential is necessary
3. **Model capability** — not all models parallelize (some call one tool at a time)

To enable parallelization, make tool descriptions very specific about what they do:

✅ Good descriptions (enable parallel):
- `getWeather`: "Get the weather for a city. Takes city name."
- `searchFlights`: "Search flights between two cities. Takes origin, destination, date."
- `getActivities`: "Get activities in a city. Takes city name."

❌ Vague descriptions (prevent parallel):
- `fetchData`: "Get data"
- `processInfo`: "Process information"

When descriptions are vague, the model doesn't know which tools are independent, so it calls them one at a time to be safe.

### Performance Trade-off: Speed vs Cost

Parallel calls are **faster but sometimes more expensive**:

- **Parallel 3 tools in 1 step**: Fast. But you call 3 tools simultaneously (3 API calls or 3 executions).
- **Sequential 3 tools in 3 steps**: Slower. But you have time to cancel or adjust based on results (fewer total executions if you're smart about it).

For Ollama (local), this doesn't matter—no API cost. But in production:
- Parallel = faster user experience, higher tool costs
- Sequential = slower user experience, lower tool costs, more control

Choose based on:
- **Speed-critical** (user is waiting) → parallelize
- **Cost-critical** (lots of API calls) → sequential with smart logic
- **Safety-critical** (verify results before proceeding) → sequential

### What You'll See

When you run this challenge, look at the DevTools output or printed steps:

```
Agent completed in 3 step(s):

--- Step 1 ---
  Tool: getWeather({"city":"Tokyo"})
  Tool: searchFlights({"from":"London","to":"Tokyo","date":"this weekend"})
  Tool: getActivities({"city":"Tokyo"})

--- Step 2 ---
  Tool: convertCurrency({"amount":350,"from":"USD","to":"GBP"})

--- Step 3 ---
  Text: Here's your Tokyo trip plan...
```

**What this means:**
- Step 1: Three tools called together (parallel). The model recognized they're independent.
- Step 2: One tool (sequential). The model waited because it needs the flight price from Step 1.
- Step 3: Final answer. The model now has all the information.

If your model calls them separately (getWeather, then searchFlights, then getActivities), that's also fine—different models batch differently. Some are conservative and call one at a time. The important thing is that the final answer uses all the results.

### Key Takeaway

The agent automatically parallelizes **independent** tools. You get fast execution without writing orchestration logic. But you control this through:
1. **Tool descriptions** (clear = agent parallelizes; vague = agent plays it safe)
2. **Tool design** (independent vs dependent inputs)
3. **Challenge design** (do you want parallel or sequential thinking?)

This is why good tool design is so important. The better your descriptions and the clearer your tool boundaries, the better decisions the model makes about when to call them.

## Suggested pace

- 3 min: read the new tool requirements
- 8 min: implement `searchFlights`, `convertCurrency`, and `getActivities`
- 3 min: wire them into the agent
- 3 min: run and inspect tool calls

If you're facilitating, remind people that the hardest part here is usually not syntax. It is understanding that the model is now choosing among several capabilities.

---

## Run it

```bash
# Run your solution for this challenge
npm run q2

# Run the reference solution (if you get stuck)
npm run solution:q2
```

## DevTools

> **Note:** AI SDK DevTools is experimental and intended for local development only. Do not use in production environments.

This challenge uses [AI SDK DevTools](https://ai-sdk.dev/docs/ai-sdk-core/devtools). You can inspect runs and steps (including multi-tool calls) in a web UI. The shared model is wrapped with DevTools middleware when not in production.

- **Launch the viewer:** In another terminal run `npm run devtools`, then open [http://localhost:4983](http://localhost:4983).
- **Disable DevTools:** Set `AI_SDK_DEVTOOLS=0` when running the agent.

## Expected output

The agent should finish in 2-4 steps, calling multiple tools:

```
🧳 TripMate Agent - Planning a trip autonomously...

Agent completed in 3 step(s):

--- Step 1 ---
  Tool: getWeather({"city":"Tokyo"})
  Tool: searchFlights({"from":"London","to":"Tokyo","date":"this weekend"})
  Tool: getActivities({"city":"Tokyo"})
--- Step 2 ---
  Tool: convertCurrency({"amount":350,"from":"USD","to":"GBP"})
--- Step 3 ---
  Text: Here's your Tokyo trip plan! The weather is sunny at 22°C...

✨ Final Response:
 Here's your complete weekend trip plan from London to Tokyo...
```

Notice how the agent calls weather, flights, and activities in parallel (Step 1), then uses the flight price to call currency conversion (Step 2), then summarises everything (Step 3). You didn't code that logic - the LLM figured it out.

Do not worry if your model chooses a slightly different order. Some models batch tool calls, some call them one at a time. The important thing is that the final answer uses the tool results.

## Checkpoint

You are on track if:

- all four tools are present in the `tools` object
- the run includes multiple tool calls
- the final answer mentions weather, flights, activities, and converted cost

If the output is partial, ask which missing fact the agent failed to gather. That usually tells you which tool needs attention.

---

## Hints

<details>
<summary>Hint 1 - searchFlights</summary>

```typescript
const searchFlights = tool({
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
      from, to, date,
      flights: [
        { airline: 'SkyWing', price: basePrice, currency: 'USD', duration: '11h 30m' },
        { airline: 'AeroConnect', price: basePrice + 80, currency: 'USD', duration: '12h 15m' },
      ],
    };
  },
});
```
</details>

<details>
<summary>Hint 2 - convertCurrency</summary>

```typescript
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
```
</details>

<details>
<summary>Hint 3 - getActivities</summary>

```typescript
const getActivities = tool({
  description: 'Get popular activities and things to do in a city',
  inputSchema: z.object({
    city: z.string().describe('The city to get activities for'),
  }),
  execute: async ({ city }) => {
    const activities: Record<string, string[]> = {
      tokyo: ['Visit Senso-ji Temple', 'Explore Shibuya Crossing', 'Try ramen in Shinjuku', 'See cherry blossoms in Ueno Park'],
      london: ['Visit the British Museum', 'Walk along the South Bank', 'Explore Camden Market', 'See a West End show'],
      bali: ['Visit Uluwatu Temple', 'Surf at Kuta Beach', 'Explore rice terraces in Ubud', 'Watch a Kecak fire dance'],
    };
    const cityActivities = activities[city.toLowerCase()] || ['Explore the city centre', 'Visit local markets', 'Try the local cuisine'];
    return { city, activities: cityActivities };
  },
});
```
</details>

<details>
<summary>Full solution</summary>

See `finish/agent.ts` or run:

```bash
npm run solution:q2
```
</details>

---

## Common Issues & Troubleshooting

| Symptom | Likely Cause | Fix | Why This Works |
|---------|--------------|-----|-----------------|
| `searchFlights is not defined` | Tool defined but not exported/wired correctly | Verify exact variable name matches in `tools` object | JavaScript requires exact identifier matching |
| `Cannot read property 'execute'` | Tool syntax error (missing `tool()` wrapper or `inputSchema`) | Check template in hints - ensure `description`, `inputSchema`, `execute` all present | `tool()` creates the proper structure for AI SDK |
| Agent only calls `getWeather` | New tools not added to `tools` object | Complete TODO 4: `tools: { getWeather, searchFlights, convertCurrency, getActivities }` | Agent can only use tools it knows about |
| `amount` validation error | Model sends string instead of number | Use `z.coerce.number()` so both `350` and `"350"` work | LLMs don't always match exact JSON types |
| Agent takes many steps (1 tool/step) | Model calls tools serially instead of batching | This is fine! Different models batch differently. See "Expected output" | Sequential execution is slower but still correct |
| Currency conversion returns rate `1` | Unknown currency pair (e.g., "JPY-GBP") | Add more pairs to `rates` map: `'JPY-GBP': 0.0067` or use fallback | Zod validation prevents bad input, but rates need coverage |
| Final answer missing currency info | `convertCurrency` not called or result ignored | Check that tool is in `tools` and instructions encourage cost comparison | Model must recognize cost as relevant to trip planning |
| `routeSeed` error in `searchFlights` | Forgot to implement deterministic pricing | Use the hint code: hash from `from-to-date` for consistent results | Mock data needs determinism so reproducible runs work |

## How to debug

When the agent behaves strangely, check these layers:

1. Tool definitions: are the descriptions clear enough?
2. Tool schemas: do the inputs match what the model is likely to send?
3. Tool results: are you returning structured data the model can easily use?
4. Agent wiring: are all tools present in the `tools` object?
5. Instructions: do they make it clear what the agent should gather before answering?

The main trap is thinking "more tools automatically means better output." The model still needs clear tool descriptions and a clear goal.

## If you're stuck

Use this escalation path:

1. Get one new tool working at a time
2. Verify all tool names match exactly
3. Confirm all tools are present in the `tools` object
4. Open the hint for the specific tool you're blocked on
5. Compare with `finish/agent.ts` only after isolating the failing tool

---

## Key Insight

The hardest part of multi-tool agents isn't making the tools work. It's designing tools that make the model's job easier.

**Good tool design means:**
- Clear descriptions (so the model knows when to use them)
- Focused scope (each tool answers one question well)
- Structured output (easy for the model to parse and use)

When the agent misbehaves (ignores a tool, calls them in wrong order, returns incomplete answers), the problem is almost always a tool design issue, not an LLM issue. Better descriptions → better decisions.

This is why the Sequential vs Parallel section matters: tool design directly shapes how the model executes. As you build more agents, spend time on descriptions and structure, not on trying to force the model to "follow orders."

---

## Success criteria

You're done when:
- `npm run q2` runs without errors
- The agent calls all 4 tools across its steps
- The final response includes weather, flights, activities, and a converted price
- You didn't write any orchestration logic -- the agent decided the order on its own
