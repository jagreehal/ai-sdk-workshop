# Shared Utilities

This directory contains shared code used across multiple challenges.

## Files

### `utils.ts`
Shared data and utilities used across all challenges.

**Exports**:
- `getRouteSeed()` - Deterministic pricing seed calculation
- `weatherData` - Weather database for all cities
- `activitiesData` - Activities database for all cities
- `currencyRates` - Currency exchange rates

**Usage**:
```typescript
import { getRouteSeed, weatherData, activitiesData, currencyRates } from './utils';

const weather = weatherData['tokyo']; // { temp: 22, condition: 'sunny' }
const price = 180 + (getRouteSeed('london', 'tokyo', '2026-05-06') % 260);
```

### `model.ts`
The configured model instance used in all challenges. Currently configured to use Ollama with `granite4` model.

**Usage**:
```typescript
import { model } from '../../../shared/model';
```

### `search-destinations.ts`
Vector search implementation for RAG challenges. Searches the destinations database and returns relevant results.

**Usage**:
```typescript
import { searchDestinations } from '../../../shared/search-destinations';
const results = await searchDestinations(query, topK);
```

### `trip-agent.ts`
**New** — Centralized agent definition with type-safe exports. Used by full-stack challenge (Challenge 07) and recommended for UI integration.

**Exports**:
- `model` (from shared/model)
- `systemPrompt` - Agent system instructions
- `tripTools` - Object containing all tools (getWeather, searchFlights, convertCurrency, getActivities, searchDestinations)
- `tripAgent` - The configured `ToolLoopAgent` instance (for CLI challenges)
- `TripAgentUIMessage` - Type for UI message streams
- Individual tools: `getWeather`, `searchFlights`, `convertCurrency`, `getActivities`, `searchDestinationsTool`

**Usage**:
```typescript
// Server-side (for streaming responses)
import { model } from '../../../shared/model';
import { systemPrompt, tripTools, type TripAgentUIMessage } from '../../../shared/trip-agent';

const aiStream = streamText({
  model,
  system: systemPrompt,
  prompt: message,
  tools: tripTools,
});

return aiStream.toUIMessageStreamResponse();
```

```typescript
// CLI usage (for ToolLoopAgent)
import { tripAgent } from '../../../shared/trip-agent';

const result = await tripAgent.generate({
  prompt: 'Plan a weekend trip',
});
```

```typescript
// Client-side (TypeScript)
import { useChat } from '@ai-sdk/react';
import type { TripAgentUIMessage } from '@/shared/trip-agent';

const { messages } = useChat<TripAgentUIMessage>({
  transport: new DefaultChatTransport({ api: '/api/chat' }),
});
```

## When to Use Each Pattern

### CLI Challenges (01-hello through 05-rag)
Define tools inline in each challenge file. This makes it easy to see the complete tool definition as part of the challenge.

```typescript
const getWeather = tool({
  description: '...',
  inputSchema: z.object({ /* ... */ }),
  execute: async ({ city }) => { /* ... */ },
});
```

### UI and Full-Stack Challenges (06-ui and 07-full-stack)
Use `tripAgent` from `shared/trip-agent.ts`. This provides:
- Centralized configuration
- Type-safe message types for the frontend
- Proper streaming response format

```typescript
import { tripAgent, type TripAgentUIMessage } from './shared/trip-agent';
```

## Best Practices

### ✅ Do
- Use `tripAgent` for any challenge that integrates with a UI framework
- Export `InferAgentUIMessage<typeof agent>` for frontend type safety
- Use `toUIMessageStreamResponse()` for streaming to UI

### ❌ Don't
- Duplicate tool definitions across files
- Use generic `tool-invocation` type in UI code (use typed tool parts instead)
- Accumulate full text responses when streaming is available

## Adding New Tools

To add a new tool to the agent:

1. Define the tool in `trip-agent.ts`:
```typescript
const newTool = tool({
  description: 'Description of what the tool does',
  inputSchema: z.object({
    param: z.string().describe('Parameter description'),
  }),
  execute: async ({ param }) => {
    // Implementation
    return { result: 'value' };
  },
});
```

2. Add it to the `tripAgent` tools object:
```typescript
export const tripAgent = new ToolLoopAgent({
  model,
  instructions: '...',
  tools: {
    // existing tools
    newTool, // add here
  },
});
```

3. The type `TripAgentUIMessage` will automatically include the new tool in its type definition.

## Type Safety Reference

### In Server Code
```typescript
import { tripAgent, type TripAgentUIMessage } from './shared/trip-agent';

// TypeScript knows the exact tools available
const stream = streamText({
  tools: tripAgent.tools, // ✅ properly typed
});
```

### In Client Code (React)
```typescript
import type { TripAgentUIMessage } from './shared/trip-agent';

export function Chat() {
  const { messages } = useChat<TripAgentUIMessage>();
  
  return messages.map(msg => (
    <div key={msg.id}>
      {msg.parts.map((part, i) => {
        // TypeScript knows exact tool types
        switch (part.type) {
          case 'tool-getWeather':
            // part.input and part.output are fully typed
            return <Weather key={i} part={part} />;
          case 'tool-searchFlights':
            return <Flights key={i} part={part} />;
        }
      })}
    </div>
  ));
}
```

## Files Structure

```
shared/
├── README.md              (this file)
├── model.ts               (model instance)
├── search-destinations.ts (RAG search)
└── trip-agent.ts          (agent + type)
```
