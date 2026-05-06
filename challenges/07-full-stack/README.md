# 07 - Full-Stack Streaming UI

> **Prerequisite:** Complete challenges 01-05 (01-hello through 05-rag) first. You need your working agent with all 5 tools.

You've built an agent that plans trips. Now ship it—put it behind a simple chat interface that feels like a product.

This challenge is different from the previous challenges. You're not building agent logic. You're taking the agent you already have and wrapping it in a web server.

## What you're building

A simple chat interface where:
1. User types a travel request
2. The request goes to a Hono server via HTTP
3. The server runs your agent (same code as before)
4. The server streams the response back to the browser in real-time
5. The UI updates as text arrives

**No React. No build step. No complexity.**

Just HTML, plain JavaScript, and Hono.

```
┌──────────────────────────┐
│   Browser UI             │
│   [User types request]   │
│         ↓                │
└────────────HTTP──────────┘
                ↓
┌──────────────────────────┐
│   Hono Server            │
│   /api/chat endpoint     │
│         ↓                │
│   Your Agent (from 05)   │
│   (tool calling, RAG)    │
│         ↓                │
│   streams text back ────→ Browser
└──────────────────────────┘
```

## Why this matters

This is the step from "script that works in the terminal" to "product people can actually use."

The agent architecture doesn't change. You're just exposing it as an HTTP endpoint and streaming responses to a UI instead of printing to console.

This is how real AI products work:
- Frontend sends messages
- Backend runs agent logic
- Backend streams responses
- Frontend renders them live

By the end, you understand the full stack: from model calls → tool design → agent loops → RAG → shipping in a UI.

## AI SDK primer

You'll use `streamText` instead of `generateText`. Same core loop, but instead of waiting for the full response, `streamText` returns a stream that you can send directly to the UI.

```typescript
// Previous challenges (script - wait for full response)
const result = await generateText({ model, prompt, tools });
console.log(result.text);

// Challenge 07 (streaming - send response chunks as they arrive)
const stream = streamText({ model, prompt, tools });
return stream.toUIMessageStreamResponse();
```

Same agent. Same tools. Same instructions. Just different how you deliver it to the user.

## Key concepts

**Hono** — A lightweight web framework. Think Express but smaller. You define routes and handlers.

```typescript
import { Hono } from 'hono';
const app = new Hono();

app.post('/api/chat', async (c) => {
  const { message } = await c.req.json();
  const aiStream = streamText({ model, system: '...', prompt: message, tools: {...} });
  return aiStream.toUIMessageStreamResponse();
});
```

**Streaming** — Instead of waiting for the entire response, send chunks as they arrive. This makes the UI feel faster and shows tool calls in real-time.

```typescript
// Instead of:
const fullText = await generateText({ model, prompt, tools });
response.send(fullText);

// You stream:
const stream = streamText({ model, prompt, tools });
return stream.toUIMessageStreamResponse();
```

**SSE (Server-Sent Events)** — A simple way to stream text from server to browser. Hono's `c.streaming()` handles this for you.

## Steps to complete

Open `start/server.ts` and `start/index.html`. You'll find TODOs for:

### Server (server.ts)

**TODO 1** — Set up the Hono app and create a `/api/chat` endpoint that:
- Accepts a POST request with `{ message: string }`
- Runs your agent from challenge 04 with that message
- Streams the response back to the browser

**TODO 2** — Use `streamText` instead of `generateText` to stream the agent's response

**TODO 3** — Handle tool calls (optional, for transparency). You can log which tools the agent calls, or send that to the frontend if you want to show tool usage in the UI

### Frontend (index.html)

**TODO 1** — Create a simple chat UI with:
- An input field for the user's message
- A button to send
- A div to display the agent's response
- Display the conversation history (user messages and agent responses)

**TODO 2** — Wire up JavaScript to:
- Listen for the send button
- Read the input field
- Send a POST request to `/api/chat`
- Read the streaming response and display it as it arrives
- Clear the input field after sending

## Suggested pace

- 2 min: read this README and understand the architecture
- 2 min: look at the starter files and identify the TODOs
- 5 min: build the server endpoint with `streamText`
- 5 min: build the HTML chat UI
- 3 min: wire up the JavaScript to send/receive
- 3 min: run it and chat with your agent

Total: ~20 minutes. If it takes longer, jump to the hints.

## How to think about this challenge

The hard part of building an AI product is agent design (which you did in challenges 02-05). The UI part is mostly plumbing:

1. **Server side:** Accept a message, run your existing agent, stream the response
2. **Client side:** Send a message, read the stream, display it

You already know how to build agents. This is just showing you what the last mile looks like.

## Run it

```bash
# Run your solution for this challenge
npm run q5

# Run the reference solution (if you get stuck)
npm run solution:q5
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

Type a travel request like:
- "Plan a weekend trip to Barcelona"
- "Find me somewhere warm and affordable"
- "What's the weather like in Tokyo?"

Watch the agent respond in real-time, with tool calls happening as you watch.

## Expected output

The UI should look simple:

```
┌─────────────────────────────────┐
│  Travel Agent Chat              │
├─────────────────────────────────┤
│ You: Plan a weekend to Tokyo    │
│                                 │
│ Agent: I'll help you plan a     │
│ weekend trip to Tokyo. Let me   │
│ gather some information...      │
│                                 │
│ [Tool: searchFlights]           │
│ [Tool: getWeather]              │
│ [Tool: getActivities]           │
│                                 │
│ Here's what I found...          │
│                                 │
│ [Input field ready for next]    │
└─────────────────────────────────┘
```

The key behavior: As the agent responds, text appears in real-time. You should see tool calls stream in as the agent uses them.

## Checkpoint

You're on track if:

- The server starts without errors
- You can open [http://localhost:3000](http://localhost:3000) in your browser
- The chat UI loads
- You can type a message and hit send
- The agent's response appears in real-time
- The page doesn't crash when the response arrives

## Common issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Cannot find module 'hono'` | Hono not installed | Run `npm install hono` in the root |
| Server won't start | Port 3000 is in use | Change the port in server.ts or kill the process using port 3000 |
| POST request fails with 404 | Route not defined | Make sure `/api/chat` route is set up correctly |
| Response doesn't stream | Not using `c.streaming()` | Use `c.streaming()` instead of `c.json()` |
| UI won't load | HTML file not served | Make sure the server serves static files (Hono requires middleware for this) |
| Agent doesn't have tools | Tools not passed to agent | Make sure your full tools object (including `searchDestinations`) is passed to `streamText()` |

## How to debug

1. **Does the server start?** Run `npm run q5` and check for errors
2. **Does the UI load?** Open [http://localhost:3000](http://localhost:3000) in your browser. Check the browser console (F12) for errors
3. **Does the message send?** Open DevTools (F12) → Network tab. Click send and check if a POST request is made to `/api/chat`
4. **Does the response stream?** Check the Network tab response preview. You should see text arriving
5. **Does the response display?** Check the browser console. Is there a JavaScript error in the UI code?

## If you're stuck

Escalation path:

1. Check common issues above — does one match your error?
2. Open Hint 1 (server setup)
3. Open Hint 2 (frontend setup)
4. Open Hint 3 (wiring it together)
5. Compare with `finish/server.ts` and `finish/index.html`

## Hints

<details>
<summary>Hint 1 - Basic server setup with Hono</summary>

```typescript
import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

// Serve static files (HTML, CSS, JS)
app.use('/', serveStatic({ root: './src', path: 'index.html' }));

// Chat endpoint
app.post('/api/chat', async (c) => {
  const { message } = await c.req.json();
  
  return c.streaming(async (writer) => {
    const stream = streamText({
      model,
      prompt: message,
      tools: { getWeather, searchFlights, convertCurrency, getActivities, searchDestinations },
    });

    for await (const chunk of stream.textStream) {
      await writer(chunk);
    }
  });
});

serve(app, { port: 3000 });
console.log('Server running on http://localhost:3000');
```

Key points:
- `app.post()` defines a POST endpoint
- `c.req.json()` reads the request body
- `streamText()` streams the agent response
- `c.streaming()` sends the stream back to the browser

</details>

<details>
<summary>Hint 2 - Simple HTML chat UI</summary>

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Travel Agent Chat</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
    .user { background: #e3f2fd; text-align: right; }
    .agent { background: #f5f5f5; }
  </style>
</head>
<body class="bg-gray-50 p-4">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Travel Agent</h1>
    
    <div id="messages" class="border rounded bg-white p-4 h-96 overflow-y-auto mb-4">
      <!-- Messages appear here -->
    </div>
    
    <div class="flex gap-2">
      <input 
        id="input" 
        type="text" 
        placeholder="Plan a trip..." 
        class="flex-1 border rounded px-3 py-2"
      />
      <button 
        id="send" 
        class="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  </div>

  <script>
    const input = document.getElementById('input');
    const send = document.getElementById('send');
    const messages = document.getElementById('messages');

    send.addEventListener('click', async () => {
      const message = input.value.trim();
      if (!message) return;

      // Add user message
      messages.innerHTML += `<div class="message user">${message}</div>`;
      input.value = '';

      // Add agent response container
      const responseEl = document.createElement('div');
      responseEl.className = 'message agent';
      messages.appendChild(responseEl);
      messages.scrollTop = messages.scrollHeight;

      // Stream the response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
        responseEl.textContent = text;
        messages.scrollTop = messages.scrollHeight;
      }
    });

    // Allow Enter to send
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') send.click();
    });
  </script>
</body>
</html>
```

Key points:
- Simple input and message display
- Tailwind CDN for styling (no build step)
- `fetch('/api/chat')` sends the message
- `response.body.getReader()` reads the stream
- Each chunk updates the UI in real-time

</details>

<details>
<summary>Hint 3 - Full server with static file serving</summary>

Hono needs middleware to serve static files. Add this to your package.json:

```json
{
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.0.0"
  }
}
```

Then use `serveStatic`:

```typescript
import { serveStatic } from '@hono/node-server/serve-static';

app.use('/', serveStatic({ root: './src', path: 'index.html' }));
```

This serves `index.html` at the root and handles CSS/JS.

</details>

## How it all connects

You've now gone from "call a model" to "model with tools" to "tools that search your data" to "UI that streams the whole thing."

Each step added a layer:
1. **Challenge 01** — Basic model call
2. **Challenge 02** — User input
3. **Challenge 03** — Single tool
4. **Challenge 04** — Multiple tools + RAG
5. **Challenge 05** — Ship it in a UI

The architecture is the same at every level. The only thing that changes is the interface.

## Success criteria

You're done when:

- ✅ Server starts without errors
- ✅ You can open [http://localhost:3000](http://localhost:3000) in a browser
- ✅ Chat UI loads
- ✅ You can type a message and send it
- ✅ The agent's response streams in real-time
- ✅ The response mentions weather, flights, activities, or destination info (proves tools are running)
- ✅ The conversation history is visible
- ✅ You didn't write any orchestration logic—the agent handled all tool decisions

## Key insight

The hardest part of building an AI product is not the UI. It's the agent. By the time you get to this challenge, you've already solved the hard problem. The UI is just plumbing to expose what you already built.

Most teams overthink UI and underthink agent design. This challenge flips that: the UI is intentionally simple so you focus on what matters—shipping a working agent that actually helps.
