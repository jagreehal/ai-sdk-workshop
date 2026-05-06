# 01 - Hello, LLM

Every AI application starts the same way: you send text to a model, the model generates text back, and you do something with that result. This challenge teaches you that foundation.

You'll call an LLM once, get a response, and print it. No loops, no tools, no complexity. Just the simplest possible interaction with a language model. Master this, and everything else in the workshop becomes about adding layers on top.

## What you'll learn

```
┌───────────────────────────┐
│   Model Call              │
│                           │
│   Prompt ──▸ LLM ──▸ Text │
│                           │
└───────────────────────────┘
```

By the end of this challenge, you'll understand:

- How the AI SDK talks to a language model
- What happens when you call `generateText()`
- Why prompts matter (they are your only input to the model)
- How to get text out and use it in your code
- The difference between a model instance and a model call

## How it works: The mental model

When you call `generateText()`, four things happen in sequence:

1. **You prepare a prompt** — a string that tells the model what you want
2. **The SDK sends it to the model** — along with configuration (which model, temperature, etc.)
3. **The model thinks** — for a few hundred milliseconds to a few seconds, it generates tokens one by one
4. **You get the full text back** — `generateText()` waits for completion and returns it all at once

This is different from streaming (which sends tokens as they arrive). Here, you wait for the full response. This is simple and synchronous — easier to understand, but slower for the user.

The key insight: **the model never knows you're from Node.js or a browser or a CLI. It only sees the prompt. Everything the model does is driven by the words you send it.**

## Key concepts you need

**Async/await:** The model takes time to respond (even if it's fast). We use `async` to mark that `main()` waits for something, and `await` to pause until `generateText()` returns.

```typescript
// The await pauses here until the model responds
const result = await generateText({...});
// Only then does this line run
console.log(result.text);
```

**Prompts are the interface:** You don't give the model code or structured data—just a string. "Tell me a joke" is the entire instruction. The quality of your prompt directly affects the quality of the response.

**The result object:** `generateText()` returns an object with multiple properties. `.text` is the generated content. There are also `.usage` (token counts), `.finishReason` (why it stopped), and others. For now, you only need `.text`.

## AI SDK primer

The AI SDK is built for this exact pattern. Here are the pieces you'll use:

- **`generateText()`** — Sends a prompt to a model, waits for the full response, returns it
- **`model`** — The language model instance (provided for you). It knows which API to call, which model to use, what your API keys are
- **`prompt`** — A plain string. Can be a question, a command, a description, anything. The model reads it and generates a response

That's it. You don't need to know about tokens, model internals, or API details. The SDK handles that. You just provide a prompt and a model, and call the function.

## The pattern

Here's what working code looks like:

```typescript
import { generateText } from 'ai';
import { model } from '../../../shared/model';

async function main() {
  const result = await generateText({
    model,
    prompt: 'Tell me a joke',
  });

  console.log(result.text);
}

main();
```

**Why each line matters:**

- Import `generateText` — the function that calls the model
- Import `model` — the pre-configured model instance (Ollama, OpenAI, Anthropic, etc.)
- `async function main()` — marks that this function will wait for something
- `await generateText(...)` — pause here until the model responds
- `result.text` — grab the generated text from the response
- `console.log(...)` — print it so you can see it
- `main()` — call the function to start the whole thing

## Steps to complete

Open `start/agent.ts`. You'll see imports, an empty `main()` function, and a function call at the bottom.

Your task: **call `generateText()` inside `main()`, store the result, and print it.**

**One TODO to fill in:**

```typescript
// TODO 1: Call generateText() with the model and ask for a joke. 
// Store the result and print the text.
```

You have the pattern above. Fill in the TODO using that pattern. The prompt can be any string you want—"Tell me a joke" is fine, but you could also try "Explain machine learning" or "Write a haiku about code" if you want.

## Suggested pace

- 1 min: read the README and starter file
- 2 min: fill in the TODO using the pattern above
- 1 min: run it and see the result

Do not overthink this. The pattern is right there. Copy it, change the prompt string if you want, and you're done.

## How to read the starter file

Open `start/agent.ts` and read it in this order:

1. **Imports** (top) — These tell you which pieces of the AI SDK are in play
2. **The `main()` function** — This is where your code goes (currently empty)
3. **The function call** (`main()` at the bottom) — This starts everything

That's the whole structure. Very simple.

## Run it

```bash
# Run your solution for this challenge
npm run q0

# Run the reference solution (if you get stuck)
npm run solution:q0
```

If it works, you'll see output like:

```
Why did the AI go to school?
To improve its learning model! 🤖
```

The joke will be different every time you run it (the model generates new text each time). If you see the same joke twice, something is wrong.

## What "working" looks like

Check these things:

- **No errors** — the code compiles and runs without crashing
- **A joke in the output** — you see text printed to the console
- **The joke changes** — run it twice, you get different jokes

If you see an error, jump to the "Debugging" section below.

## How it all connects

This challenge is the foundation for the entire workshop.

- **Next challenge** adds user input (same pattern, but the prompt changes based on what the user types)
- **Challenge after that** adds a loop and tools (the model can ask for help, you give it a tool, it keeps asking until it has enough info)
- **Later challenges** add retrieval, UI, multiple tools — but they all use the same core pattern you're learning here

If you understand this challenge deeply, you understand the mental model of the whole workshop.

## Common mistakes (avoid these)

**"I wrote the code but nothing happens"**

Check that you actually call `main()` at the bottom. The function definition does nothing by itself—you have to invoke it.

**"The model never gets called"**

You need `await`. Without it, the code runs but the function returns a Promise instead of waiting for the response. You'll get undefined behavior.

**"I get errors about async/await"**

Make sure `main()` is declared as `async`. Only async functions can use `await` inside them.

**"The response is always the same"**

You're probably calling the wrong model or there's a caching issue. Each call should generate fresh text. If it doesn't, check that you're running `npm run q0` from the repo root (not from inside the challenges folder).

## Debugging

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module '../../../shared/model.ts'` | You're running from the wrong directory | Run `npm run q0` from the repo root, not from inside a challenge folder |
| `generateText is not defined` | You didn't import it | Add `import { generateText } from 'ai'` at the top |
| `model is not defined` | You didn't import it | Add `import { model } from '../../../shared/model'` at the top |
| `await is only valid in async functions` | Your function isn't declared as async | Make sure the function is `async function main()` |
| `Cannot read property 'text' of undefined` | The result object is empty | Make sure you're calling `generateText()` with both `model` and `prompt` |
| Nothing prints | You're not calling `console.log()` | Make sure you have `console.log(result.text)` after the generateText call |

## How to debug step by step

If something breaks, follow this checklist:

1. **Does the file compile?** Run `npm run q0` and look at the error message. Is it a syntax error (red squiggly lines) or a runtime error (crashes after starting)?

2. **Did you import both `generateText` and `model`?** Check the top of the file. You need both imports.

3. **Is `main()` declared as `async`?** TypeScript will yell if you use `await` in a non-async function.

4. **Does `generateText()` have both parameters?** It needs `model: model` and `prompt: '...'`. Both are required.

5. **Are you accessing `.text` on the result?** Not just `result`, but `result.text`.

6. **Are you calling `main()` at the bottom?** Just defining the function doesn't run it.

If none of that works, look at the hints below.

## If you're stuck

Go through this escalation path:

1. **Look at the pattern above** — is there anything different between your code and the pattern?
2. **Check the common mistakes** — does your error match one listed there?
3. **Open Hint 1** — it shows the full solution
4. **Compare with `finish/agent.ts`** — if hints don't help, look at the reference solution

## Hints

Try to solve it yourself first. If you get stuck, open these one at a time.

<details>
<summary>Hint 1: The full solution</summary>

```typescript
import { generateText } from 'ai';
import { model } from '../../../shared/model';

async function main() {
  const result = await generateText({
    model,
    prompt: 'Tell me a joke',
  });

  console.log(result.text);
}

main();
```

**Breaking it down:**

- `const result = await generateText({...})` — call the model, wait for the response, store it
- `model` and `prompt` are the only two required parameters
- `result.text` extracts the generated string from the response object
- `console.log(result.text)` prints it
- `main()` at the bottom actually runs the function

</details>

<details>
<summary>Hint 2: Understanding `await`</summary>

The `await` keyword pauses your code until the model responds. Without it:

```typescript
// WRONG - doesn't wait
const result = generateText({...});
console.log(result.text); // result is a Promise, not the actual response
```

```typescript
// RIGHT - waits for the response
const result = await generateText({...});
console.log(result.text); // result is the actual response object
```

Always use `await` with `generateText()`.

</details>

<details>
<summary>Hint 3: If you want to customize the prompt</summary>

You don't have to ask for a joke. Try any of these:

- `prompt: 'Explain quantum computing in one sentence'`
- `prompt: 'Write a haiku about code'`
- `prompt: 'What is the capital of France?'`
- `prompt: 'Describe the color blue to someone who has never seen it'`

The model will generate different responses based on your prompt. This is how you shape what the model does.

</details>

## DevTools

> **Note:** AI SDK DevTools is experimental and intended for local development only. Do not use in production.

DevTools lets you inspect every LLM call your code makes. This is your window into what the model sees and what it decides to do.

### How to use it

In **one terminal**, start the DevTools viewer:

```bash
npm run devtools
```

In **another terminal**, run your challenge:

```bash
npm run q0
```

Then open [http://localhost:4983](http://localhost:4983). You'll see your LLM request and response in real-time.

### What to look for

Click the run to expand it. You should see:

- **Input parameters** — Your prompt goes here ("Tell me a joke")
- **Output content** — The generated text from the model
- **Token usage** — How many input and output tokens were used
- **Timing** — How long it took the model to respond

This is helpful for understanding:
- What the model actually received (sometimes formatting surprises)
- How many tokens each call uses (useful for understanding cost/performance)
- Whether the model understood your prompt

### Debugging

If nothing appears in DevTools:

1. Make sure you're running both `npm run devtools` and `npm run q0` in separate terminals
2. Check your terminal output for errors
3. Try refreshing [http://localhost:4983](http://localhost:4983)

To disable DevTools (for performance testing):

```bash
AI_SDK_DEVTOOLS=0 npm run q0
```

## Success criteria

You're done when:

- ✅ The code compiles without errors
- ✅ You see text output (a joke, or whatever you prompted for)
- ✅ You run it twice and get different outputs (proves the model is generating fresh text, not reading from a cache)

Once this works, you understand the foundation. Everything in the workshop builds on this pattern.
