// Challenge 03: Tools
// Build an agent that uses getWeather to answer travel questions

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { model } from '../../../shared/model.ts';
import { weatherData } from '../../../shared/utils.ts';

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

const agent = new ToolLoopAgent({
  model,
  instructions: 'You are TripMate, a helpful travel assistant. When asked about weather or what to pack, use the getWeather tool to check conditions first.',
  tools: { getWeather },
  stopWhen: stepCountIs(10),
});

async function main() {
  console.log('🧳 TripMate Agent — What should I pack?\n');

  const result = await agent.generate({
    prompt: 'What should I pack for a trip to Tokyo?',
  });

  console.log(`Agent completed in ${result.steps.length} step(s):\n`);

  for (const [i, step] of result.steps.entries()) {
    console.log(`--- Step ${i + 1} ---`);
    for (const call of step.toolCalls) {
      console.log(`  Tool: ${call.toolName}(${JSON.stringify(call.input)})`);
    }
    if (step.text) {
      console.log(`  Text: ${step.text.slice(0, 100)}...`);
    }
  }

  console.log('\n✨ Final Response:\n', result.text);
}

main().catch(console.error);
