# AI-SDK Workshop

Build an AI trip planner agent in under an hour.

You'll learn how to:

- expose tools to an LLM
- let the model decide when to call them
- add retrieval over your own data
- stream the result into a React chat UI

Everything runs locally with Ollama — no API keys, no cloud account, no cost.

```bash
npm install
npm --prefix challenges/04-ui install
npm run verify
npm run q1
```

## What you're building

```
You: Plan a weekend in Lisbon on a budget

TripMate:
  [calls getWeather("Lisbon")] -> 24°C, sunny
  [calls searchFlights("London", "Lisbon")] -> £142 SkyWing
  [searches destinations database] -> Lisbon recommendations

  Here's your weekend in Lisbon!
```

## Challenges

| Challenge     | Goal                                  | Command      |
| ------------- | ------------------------------------- | ------------ |
| 01 Tools      | Add a weather tool                    | `npm run q1` |
| 02 More Tools | Add flights + activities              | `npm run q2` |
| 03 RAG        | Search destination data with RAG      | `npm run q3` |
| 04 UI         | Stream responses into a React chat UI | `npm run ui` |

If you get stuck, use the matching solution script:

- `npm run solution:q1`
- `npm run solution:q2`
- `npm run solution:q3`
- `npm run solution:ui`

## Quick start

### Dev Container (recommended)

1. Clone the repo and open in VS Code.
2. Click "Reopen in Container" when prompted.
3. Wait for model downloads (~3GB first run).
4. Run: `npm run verify`.

### Manual setup

Install [Ollama](https://ollama.com) first, then run:

```bash
# Pull models
ollama pull granite4:latest
ollama pull embeddinggemma:latest

# Install dependencies
npm install
npm --prefix challenges/04-ui install

# Verify your setup
npm run verify
```

## How the agent works

You don't need prior AI SDK experience. The challenges build on each other, so follow them in order.

Here's the mental model:

- The model generates text and decides when it needs help
- A tool is a typed function you expose to the model
- The agent loop sends the prompt to the model, runs any tool calls, feeds the results back, and repeats until the model can answer
- RAG is the same pattern again, except the tool searches your own data
- The UI challenge uses the same ideas, but streams the answer into a chat interface

If you ever get lost, ask these four questions:

1. What does the model know right now?
2. What tool is available to help it?
3. What shape of input does that tool expect?
4. What result does the tool return back into the loop?

## How to use this workshop

If you're running this live in a group:

- stay on the challenge README until the room understands the goal
- give people 5-10 minutes to try the TODOs before showing hints
- use the `solution:*` scripts to recover quickly if the room gets stuck

If you're doing this on your own:

- do the challenges in order
- try each TODO before opening the hints
- run the challenge after every small change instead of waiting until the end
- compare with `finish/` only after you have a concrete question

## How challenges work

Each challenge contains:

- `start/`: scaffold with TODOs for you to fill in
- `finish/`: complete reference solution

Each `start/` includes the previous challenge's completed code, so you can jump in at any point.

The intended flow for new learners is:

1. Read the challenge README first
2. Open the matching `start/agent.ts` or `vite-api-plugin.ts`
3. Complete the TODOs in order
4. Run the challenge script
5. Compare with the `finish/` solution only if you get stuck

Each challenge README explains the concept, the relevant APIs, the TODOs, how to debug, and what "working" looks like.

## Scripts

| Command               | What it runs              |
| --------------------- | ------------------------- |
| `npm run q1`          | Challenge 01: Tools       |
| `npm run q2`          | Challenge 02: More Tools  |
| `npm run q3`          | Challenge 03: RAG         |
| `npm run ui`          | Challenge 04 starter UI   |
| `npm run solution:q1` | Solution for Challenge 01 |
| `npm run solution:q2` | Solution for Challenge 02 |
| `npm run solution:q3` | Solution for Challenge 03 |
| `npm run solution:ui` | Solution for Challenge 04 |
| `npm run verify`      | Verify your setup         |

## Prerequisites

- Node.js 22+
- 8GB RAM recommended
- Docker or Dev Containers (optional, but recommended)

## Tech stack

- [Vercel AI SDK v6](https://sdk.vercel.ai/)
- `@ai-sdk/react` UI hooks paired with `ai` v6 core APIs
- [Ollama](https://ollama.com/)
- [ai-sdk-ollama](https://github.com/jreehal/ai-sdk-ollama)
- `granite4:latest` (chat)
- `embeddinggemma:latest` (embeddings)
- React + Vite + Tailwind (UI challenge)

## AI SDK APIs you'll use

You only need a few AI SDK APIs for this workshop:

- `tool(...)`: defines a model-callable tool
- `ToolLoopAgent`: runs the agent loop for the CLI challenges
- `stepCountIs(10)`: stops the loop from running forever
- `agent.generate(...)`: sends a prompt into the loop and returns steps plus final text
- `streamText(...)`: the streaming equivalent used in the UI challenge
- `convertToModelMessages(...)`: converts UI messages into the format the model expects
- `toUIMessageStreamResponse()`: turns a streamed model result into a browser-friendly response

You do not need to memorize these up front. Each challenge introduces them in context.

## Pairing

We recommend working in pairs:

- Driver writes code
- Navigator validates outputs and reads hints
- Swap roles at challenge boundaries
