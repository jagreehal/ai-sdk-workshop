// Challenge 1: Agent + One Tool
// Goal: Build an agent that uses getWeather to answer travel questions
//
// An agent is an LLM + tools + a loop:
//   1. The model reads the prompt and decides which tool to call
//   2. The SDK runs the tool and feeds the result back
//   3. Repeat until the model has enough info to respond
//
// A tool has 3 parts:
//   - description: when the model should use the tool
//   - inputSchema: what shape of input the tool accepts
//   - execute: what application code runs when the tool is called

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { model } from '../../../shared/model.ts';

// --- TODO 1: Define the getWeather tool ---
// Use tool() to expose a capability to the model.
// The model is not calling weatherData directly — it only sees the tool contract.
//
// Create getWeather with:
//   description: 'Get the current weather for a city'
//   inputSchema: z.object({ city: z.string().describe('The city name') })
//   execute: async ({ city }) => look up city in weatherData and return { city, temperature, condition }
//
// Weather data to use:
const weatherData: Record<string, { temp: number; condition: string }> = {
  london: { temp: 12, condition: 'rainy' },
  tokyo: { temp: 22, condition: 'sunny' },
  bali: { temp: 30, condition: 'tropical' },
  paris: { temp: 18, condition: 'partly cloudy' },
  lisbon: { temp: 24, condition: 'sunny and mild' },
};

// const getWeather = tool({ ... })

// --- TODO 2: Create a ToolLoopAgent ---
// This is what wires the model to the tool.
// If the model decides it needs weather information, the SDK will run getWeather for you.
//
// Use new ToolLoopAgent() with:
//   model: model
//   instructions: a system prompt telling the agent it's TripMate, a travel assistant
//                 and that it should use getWeather before answering weather/packing questions
//   tools: { getWeather }
//   stopWhen: stepCountIs(10)

// const agent = new ToolLoopAgent({ ... })

// --- Main (pre-built) ---
async function main() {
  console.log('🧳 TripMate Agent — What should I pack?\n');

  // TODO 3: Call agent.generate() with prompt: 'What should I pack for a trip to Tokyo?'
  // generate() starts the agent loop and returns both:
  //   - result.steps: each model/tool step
  //   - result.text: the final answer
  // const result = await agent.generate({ ... })

  // Uncomment once you have result.
  // Check for:
  //   1. a getWeather tool call
  //   2. a final answer that actually uses the tool result
  // console.log(`Agent completed in ${result.steps.length} step(s):\n`);
  //
  // for (const [i, step] of result.steps.entries()) {
  //   console.log(`--- Step ${i + 1} ---`);
  //   for (const call of step.toolCalls) {
  //     console.log(`  Tool: ${call.toolName}(${JSON.stringify(call.input)})`);
  //   }
  //   if (step.text) {
  //     console.log(`  Text: ${step.text.slice(0, 100)}...`);
  //   }
  // }
  //
  // console.log('\n✨ Final Response:\n', result.text);
}

main().catch(console.error);
