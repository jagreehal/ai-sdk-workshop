# 02 - Multi-Tool Agent

In Challenge 1 you gave TripMate one tool: weather. Now give it flights, currency conversion, and activities.

You don't orchestrate the tools. You define them, hand them to the agent, and the LLM decides which to call and in what order. One prompt can trigger a chain of tool calls.

## AI SDK primer

Same AI SDK pattern as Challenge 1. The only difference is the model now has more tools.

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

## Suggested pace

- 3 min: read the new tool requirements
- 8 min: implement `searchFlights`, `convertCurrency`, and `getActivities`
- 3 min: wire them into the agent
- 3 min: run and inspect tool calls

If you're facilitating, remind people that the hardest part here is usually not syntax. It is understanding that the model is now choosing among several capabilities.

---

## Run it

```bash
npm run q2
```

## DevTools

> **Note:** AI SDK DevTools is experimental and intended for local development only. Do not use in production environments.

This challenge uses [AI SDK DevTools](https://ai-sdk.dev/docs/ai-sdk-core/devtools). You can inspect runs and steps (including multi-tool calls) in a web UI. The shared model is wrapped with DevTools middleware when not in production.

- **Launch the viewer:** In another terminal run `npx @ai-sdk/devtools`, then open [http://localhost:4983](http://localhost:4983).
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

## Common issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `searchFlights is not defined` | Tool defined but not exported/named correctly | Make sure the variable name matches exactly |
| Agent only calls `getWeather` | New tools not added to `tools` object | Complete TODO 4: `tools: { getWeather, searchFlights, convertCurrency, getActivities }` |
| `amount` validation error | Model sends a string instead of number for `amount` | Use `z.coerce.number()` so both `350` and `"350"` work |
| Agent takes many steps | Model calls tools one at a time instead of in parallel | This is fine - different models batch differently |
| Currency conversion returns `1` rate | Unknown currency pair | Add more pairs to the `rates` map or use a fallback |

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

## Success criteria

You're done when:
- `npm run q2` runs without errors
- The agent calls all 4 tools across its steps
- The final response includes weather, flights, activities, and a converted price
- You didn't write any orchestration logic -- the agent decided the order on its own
