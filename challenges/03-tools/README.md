# 02 - Agent + One Tool

You're building **TripMate**, an AI travel assistant. An agent is just an LLM + tools + a loop - the model decides what tool to call, the SDK runs it, and the result gets fed back until the model has enough info to answer. In this challenge, you'll create your first agent with a single weather tool.

## What you'll learn

```
┌──────────────────────────────────────┐
│            Agent Loop                │
│                                      │
│   Prompt ──▸ LLM ──▸ Tool Call?      │
│               ▲          │ yes       │
│               │          ▼           │
│               └── Result from Tool   │
│                                      │
│         no tool call? ──▸ Done!      │
└──────────────────────────────────────┘
```

- Agent = LLM + tools + loop. The `ToolLoopAgent` handles the loop for you.
- A tool has 3 parts:
  1. `description` - tells the model what the tool does
  2. `inputSchema` - a Zod schema defining the input
  3. `execute` - an async function that runs when the model calls the tool

## AI SDK primer

If you're new to the AI SDK, these are the only APIs that matter here:

- `tool(...)` creates a tool the model can call
- `ToolLoopAgent` handles the back-and-forth loop between model and tools
- `stepCountIs(10)` is a safety limit so the loop cannot run forever
- `agent.generate({ prompt })` starts the loop and returns both the intermediate `steps` and final `text`

Think of this challenge as "define one capability, then let the model decide when to use it."

## The pattern

```typescript
import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';

const myTool = tool({
  description: 'What this tool does',
  inputSchema: z.object({ param: z.string() }),
  execute: async ({ param }) => {
    return { result: `Got ${param}` };
  },
});

const agent = new ToolLoopAgent({
  model,
  instructions: 'You are a helpful assistant.',
  tools: { myTool },
  stopWhen: stepCountIs(10),
});

const result = await agent.generate({ prompt: 'Do something' });
console.log(result.text);
```

## Steps to complete

Open `start/agent.ts` and work through the three TODOs:

1. **TODO 1** - Define the `getWeather` tool using `tool()` with a description, Zod input schema, and an execute function that looks up weather data
2. **TODO 2** - Create a `ToolLoopAgent` with the model, instructions, your tool, and a stop condition
3. **TODO 3** - Call `agent.generate()` with a travel prompt, then uncomment the output code below it

## Suggested pace

- 2 min: read the README and starter file
- 5 min: define `getWeather`
- 3 min: wire the agent
- 2 min: run and inspect the output

If you're facilitating, do not rush this stage. This is where the mental model for the whole workshop gets established.

## How to read the starter file

When you open `start/agent.ts`, scan it in this order:

1. Imports: these tell you which AI SDK pieces are in play
2. Mock data: this is the local data your tool will read from
3. Tool definition: this is the capability you are exposing
4. Agent definition: this wires the model to the tool
5. `main()`: this is where the run starts and where the output is printed

If you keep those five layers in mind, the file becomes much easier to navigate.

## Run it

```bash
# Run your solution
npm run q1

# Run the reference solution
npm run solution:q1
```

If the script succeeds, look for:

- one tool call to `getWeather`
- a final text response that clearly uses the returned weather data

## Checkpoint

You are on track if:

- the file compiles
- the model calls `getWeather`
- the final answer clearly references the weather result

If you only see text and no tool call, do not keep guessing. Go back and inspect the tool description, agent instructions, and `tools` object.

## DevTools

> **Note:** AI SDK DevTools is experimental and intended for local development only. Do not use in production environments.

DevTools gives you full visibility into the agent loop. You can see the LLM request, its decision to call a tool, the tool's execution, and the final response—all in one place.

### How to use it

In **one terminal**, start the DevTools viewer:

```bash
npm run devtools
```

In **another terminal**, run your agent:

```bash
npm run q1
```

Then open [http://localhost:4983](http://localhost:4983).

### What you should see

A single run with **multiple steps**:

- **Step 1**: Initial LLM call (your prompt + tool description)
- **Step 2**: LLM's response (it decides to call `getWeather`)
- **Step 3**: Tool execution (the weather data is looked up)
- **Step 4**: LLM generates final answer

### Debugging: "My tool never gets called"

1. Open DevTools and find your run
2. Click **Step 1** to expand it
3. Look at the **"Tools"** section — you should see `getWeather` listed
4. Look at the tool's `description` field — is it clear? (Bad: "Get weather". Good: "Get the current weather for a city")
5. Look at the **System prompt** — does it tell the model to use this tool?

**If the tool isn't in Step 1:**
- The tool wasn't added to the `tools` object in your agent config

**If the tool is listed but Step 2 has no tool call:**
- Update the tool `description` to be more explicit ("Use this to check weather before giving packing advice")
- Update your `instructions` to mention the tool ("When asked about what to pack, use the getWeather tool")

### Debugging: "My tool returns the wrong data"

1. Open the step where the tool is called
2. Look at **"Tool result"** or **"Output content"** — what did your tool actually return?
3. Compare it with what your `execute` function should return
4. Are you missing fields? Returning strings instead of objects?

### Disable DevTools (optional)

```bash
AI_SDK_DEVTOOLS=0 npm run q1
```

## Expected output

You should see something like this (the exact text will vary):

```
🧳 TripMate Agent - What should I pack?

Agent completed in 2 step(s):

--- Step 1 ---
  Tool: getWeather({"city":"Tokyo"})
--- Step 2 ---
  Text: Based on the current weather in Tokyo (22°C, sunny)...

✨ Final Response:
 For your trip to Tokyo, the weather is currently 22°C and sunny!
 Here's what I'd recommend packing:
 - Light layers (t-shirts, a light jacket for evenings)
 - Comfortable walking shoes
 - Sunglasses and sunscreen
 ...
```

## Debugging

| Problem | Fix |
|---------|-----|
| `Cannot find module '../../../shared/model.ts'` | Make sure you're running from the repo root with `npm run q1` |
| `getWeather is not defined` | You need to uncomment and complete TODO 1 first |
| Agent runs but no tool calls show up | Check that your `tools` object uses the right key: `{ getWeather }` |
| `ToolLoopAgent is not a constructor` | Make sure your import matches: `import { ToolLoopAgent, tool, stepCountIs } from 'ai'` |
| Ollama connection error | Run `ollama serve` in another terminal, then `ollama pull granite4:latest` |

## How to debug

If something goes wrong, debug in this order:

1. Does the file compile?
2. Is `getWeather` defined?
3. Is the agent wired with `tools: { getWeather }`?
4. Do the instructions clearly tell the model to use the tool?
5. Does `execute` return an object?

The most common beginner mistake is assuming the model will "just know" when to use a tool. It usually needs a clearer description or clearer instructions.

## If you're stuck

Use this escalation path:

1. Re-read TODO 1 and confirm the tool shape
2. Compare your imports and agent config with the pattern shown above
3. Open Hint 1 only
4. If needed, open Hint 2
5. Only then compare with `finish/agent.ts`

## Hints

Try to solve it yourself first! If you get stuck, open these one at a time.

<details>
<summary>Hint 1: Defining the tool</summary>

```typescript
const getWeather = tool({
  description: 'Get the current weather for a city',
  inputSchema: z.object({
    city: z.string().describe('The city name'),
  }),
  execute: async ({ city }) => {
    const weather = weatherData[city.toLowerCase()] || { temp: 20, condition: 'mild' };
    return { city, temperature: `${weather.temp}°C`, condition: weather.condition };
  },
});
```

The key bits: `description` tells the model when to use it, `inputSchema` defines the shape of the input, and `execute` does the actual work.
</details>

<details>
<summary>Hint 2: Creating the agent</summary>

```typescript
const agent = new ToolLoopAgent({
  model,
  instructions: 'You are TripMate, a helpful travel assistant. When asked about weather or what to pack, use the getWeather tool to check conditions first.',
  tools: { getWeather },
  stopWhen: stepCountIs(10),
});
```

The `instructions` act as the system prompt. `stopWhen: stepCountIs(10)` prevents infinite loops.
</details>

<details>
<summary>Hint 3: Calling generate</summary>

```typescript
const result = await agent.generate({
  prompt: 'What should I pack for a trip to Tokyo?',
});
```

Then uncomment the logging code below it to see the steps and final response.
</details>

<details>
<summary>Full solution walkthrough</summary>

Here's what's happening end to end:

1. **Tool definition** - `getWeather` has fake weather data for 5 cities. When the model calls it with `{ city: "Tokyo" }`, the execute function looks up Tokyo and returns `{ city: "Tokyo", temperature: "22°C", condition: "sunny" }`.

2. **Agent creation** - The `ToolLoopAgent` wires the model to the tool. The instructions tell the model it's a travel assistant and should check weather before giving advice.

3. **Generate** - When you call `agent.generate()`, the SDK:
   - Sends the prompt + instructions to the LLM
   - The LLM sees the `getWeather` tool and decides to call it with `Tokyo`
   - The SDK runs `execute({ city: "Tokyo" })` and feeds the result back
   - The LLM now has weather data and writes a packing recommendation
   - No more tool calls, so the loop ends

The `result` object has `steps` (each loop iteration) and `text` (the final answer).
</details>

## Common failure modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Model doesn't call the tool | Weak instructions | Add "use the getWeather tool" to your instructions |
| `execute` returns undefined | Forgot the return statement | Make sure `execute` returns an object |
| TypeScript error on `inputSchema` | Wrong Zod syntax | Use `z.object({ city: z.string() })` - don't forget the `.object()` wrapper |
| Agent loops forever | Missing `stopWhen` | Add `stopWhen: stepCountIs(10)` to the agent config |

## Success criteria

You're done when the agent calls `getWeather` and gives packing advice based on the weather data. You should see at least one tool call in the step output, followed by a response that uses it.
