# 01b - User Input (Optional Variant)

You just called an LLM with a fixed prompt. Now make it interactive: ask the user for input, build a prompt from that input, send it to the model, and return a response.

This is the jump from "static script" to "interactive program." Everything from here on in the workshop uses this pattern.

## What you'll learn

```
┌─────────────────────────────────┐
│   Interactive Model Call        │
│                                 │
│   User Input ──▸ Prompt         │
│                       │ ▼        │
│                   LLM ──▸ Response
│                                 │
└─────────────────────────────────┘
```

By the end of this challenge, you'll understand:

- How to ask the user for input at the terminal
- How to build dynamic prompts (combining user input with instructions)
- Why prompts are strings (not objects or code) — they're flexible
- How user input shapes model output
- The loop: ask → prompt → model → respond

## How it works: The mental model

Last challenge, your prompt was hardcoded: `'Tell me a joke'`. The model had no way to know what the user actually wanted.

Now you'll do this:

1. **Ask the user** — "What topic do you want a joke about?"
2. **Read their answer** — they type "cats"
3. **Build a prompt** — combine it: `'Tell me a joke about cats'`
4. **Send to the model** — the model now has the user's actual input
5. **Show the response** — print the joke about cats

The key: **the model never sees the user directly. You translate user input into a prompt, and the model responds to that prompt.**

This pattern scales to everything else in the workshop:
- Agents work the same way (user input → system prompt + user message → model → response)
- RAG works the same way (user input → search → augment prompt → model → response)
- UI works the same way (user message → server → build prompt → model → stream response)

## Key concepts you need

**Template literals** — You'll use JavaScript's backtick syntax to build strings:

```typescript
const topic = 'cats';
const prompt = `Tell me a joke about ${topic}`;
// prompt is now: "Tell me a joke about cats"
```

The `${...}` inserts variables into strings. This is how you make prompts dynamic.

**Readline** — Node.js needs a special module to ask for input at the terminal:

```typescript
const terminal = readline.createInterface({
  input: process.stdin,    // read from keyboard
  output: process.stdout,  // write to console
});

const topic = await terminal.question('Enter a topic: ');
// Waits for the user to type and hit enter
```

**Sequential vs. concurrent** — This challenge is sequential (ask for input, then call the model, then print). The model is called *after* you have the user's input. This is different from an agent loop (which calls the model, checks if it needs tools, calls tools, then calls the model again).

## AI SDK primer

You're using the same `generateText()` from the last challenge. The difference is the prompt is no longer hardcoded:

- **`generateText()`** — Same as before. Sends a prompt to the model, waits for the response
- **`model`** — Same model instance
- **`prompt`** — Now built from user input, not hardcoded
- **`readline.question()`** — Asks the user for input and waits for their answer

The only new piece is `readline`. Everything else is the same.

## The pattern

Here's what working code looks like:

```typescript
import { generateText } from 'ai';
import { model } from '../../../shared/model';
import * as readline from 'node:readline/promises';

async function main() {
  // Set up readline to ask for input
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Ask the user for a topic
  const topic = await terminal.question('Enter a topic: ');

  // Build a prompt that includes the user's input
  const result = await generateText({
    model,
    prompt: `Tell me a joke about ${topic}`,
  });

  // Print the response
  console.log(result.text);

  // Clean up
  terminal.close();
}

main();
```

**Why each part matters:**

- **`readline.createInterface()`** — Creates an input/output interface for the terminal
- **`await terminal.question()`** — Asks the user for input and waits for their answer
- **Template literal with `${topic}`** — Embeds the user's input into the prompt
- **`generateText()` with the dynamic prompt** — The model sees the user's actual input
- **`terminal.close()`** — Cleans up the readline interface when you're done

## Steps to complete

Open `start/agent.ts`. You'll see imports, an empty `main()` function, and two TODOs.

**TODO 1:** Set up readline so you can ask for input

```typescript
// TODO 1: Create a readline interface
```

You have the pattern above. Copy the readline setup from the pattern.

**TODO 2:** Ask for a topic, call `generateText()` with a dynamic prompt, print the result

```typescript
// TODO 2: Ask the user for a topic, build a prompt, call the model, print the response
```

Use the user's input to build the prompt. If they type "dogs", the prompt should be "Tell me a joke about dogs".

## Suggested pace

- 2 min: read the README and starter file
- 3 min: set up readline (TODO 1)
- 2 min: ask for input and build the dynamic prompt (TODO 2)
- 2 min: run it and test with different topics

Total: ~9 minutes. If it takes longer, jump to the hints.

## How to read the starter file

Open `start/agent.ts` and read in this order:

1. **Imports** (top) — Note the new `readline` import
2. **The `main()` function** — Currently empty, with TODO markers
3. **The function call** (`main()` at the bottom) — Starts everything

## Run it

```bash
# Run your solution for this challenge
npm run q0-input

# Run the reference solution (if you get stuck)
npm run solution:q0-input
```

When you run it, you'll see a prompt:

```
Enter a topic: 
```

Type something (e.g., "tacos") and hit enter. The model will generate a joke about it:

```
Enter a topic: tacos
Why did the taco go to the doctor?
Because it was feeling crumbly! 🌮
```

Run it multiple times with different topics. Each should generate different jokes based on what you typed.

## What "working" looks like

- ✅ You see the prompt asking for input
- ✅ You can type and hit enter
- ✅ The model generates a joke about your topic
- ✅ Different topics produce different jokes
- ✅ No errors

## How it all connects

Last challenge was the static version. This challenge adds interactivity.

Everything else in the workshop uses this pattern:
- **Agents** — ask for a travel goal → model sees it and uses tools → streams response
- **RAG** — ask a question → search your data → augment the prompt → model answers grounded in your data
- **UI** — user types in chat → server builds a prompt → streams to frontend

If you understand this challenge, you understand the core loop that powers every AI application.

## Key insight

**Prompts are strings. User input is also a string. So prompts can be built from user input.**

This is incredibly powerful. It means:
- You can ask the user "What should I do?" and the model reads their answer
- You can ask them "What data do you want?" and search for it
- You can ask them anything, and the model responds based on what they said

The model doesn't know whether a prompt came from a hardcoded string or user input. It just reads what's in the prompt.

## Common mistakes (avoid these)

**"I set up readline but it's hanging"**

Make sure you're using `await terminal.question()`. Without `await`, the code doesn't wait for the user to type.

**"The prompt doesn't include my input"**

Check that you're using template literals (backticks), not regular quotes:

```typescript
// WRONG
prompt: 'Tell me a joke about ' + topic  // This might work but it's old-style
prompt: `Tell me a joke about ${topic}`   // RIGHT - modern JavaScript
```

Both technically work, but template literals are clearer.

**"The model is called before I type anything"**

You need `await` on both the question and the generateText call:

```typescript
const topic = await terminal.question(...);      // Wait for user input
const result = await generateText({...});         // Then call the model
```

Without those `await`s, everything happens at once and the model gets called before you've had a chance to type.

**"The program doesn't exit after I run it"**

You forgot to call `terminal.close()`. This cleans up the readline interface and lets the program finish.

## Debugging

| Error | Cause | Fix |
|-------|-------|-----|
| Program hangs after prompting for input | No `await` on `terminal.question()` | Add `await` before `terminal.question()` |
| Model is called immediately, ignoring my input | Code isn't waiting for readline | Wrap the generateText call in `await`, after the readline call |
| Template literal isn't working (shows `${topic}` literally) | Using single/double quotes instead of backticks | Use backticks: `` `Tell me a joke about ${topic}` `` |
| `readline is not defined` | Didn't import it | Add `import * as readline from 'node:readline/promises'` |
| `terminal.question is not a function` | Didn't create the interface | Make sure you have `const terminal = readline.createInterface(...)` |
| Program hangs after the joke | No `terminal.close()` | Add `terminal.close()` after `console.log()` |
| Module not found error | Wrong import path | Use `'node:readline/promises'` exactly (note the `node:` prefix) |

## How to debug step by step

1. **Does the file compile?** Run `npm run q0-input`. Look for TypeScript errors.

2. **Did you set up readline?** Check that you have `readline.createInterface()` before the `terminal.question()` call.

3. **Are both calls awaited?** Both `terminal.question()` and `generateText()` need `await` in front.

4. **Does your prompt include the topic?** Check that the prompt is `` `Tell me a joke about ${topic}` `` with backticks and `${...}` syntax.

5. **Did you call `terminal.close()`?** This should be after the joke is printed.

6. **Are you calling `main()` at the bottom?** The function needs to be invoked to run.

## If you're stuck

Escalation path:

1. **Check the pattern above** — is there anything different?
2. **Look at "Common mistakes"** — does one match your error?
3. **Open Hint 1** — shows the full solution
4. **Look at `finish/agent.ts`** — the reference implementation

## Hints

Try to solve it yourself first. Open these one at a time if needed.

<details>
<summary>Hint 1: Setting up readline</summary>

```typescript
const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
```

This creates the interface. You only need to do this once, before you call `question()`.

</details>

<details>
<summary>Hint 2: Asking for input and building the prompt</summary>

```typescript
const topic = await terminal.question('Enter a topic: ');

const result = await generateText({
  model,
  prompt: `Tell me a joke about ${topic}`,
});

console.log(result.text);
```

Notice:
- `await` on `terminal.question()` so we wait for the user to type
- Backticks and `${topic}` in the prompt string
- `await` on `generateText()` so we wait for the model

</details>

<details>
<summary>Hint 3: The full solution</summary>

```typescript
import { generateText } from 'ai';
import { model } from '../../../shared/model';
import * as readline from 'node:readline/promises';

async function main() {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const topic = await terminal.question('Enter a topic: ');

  const result = await generateText({
    model,
    prompt: `Tell me a joke about ${topic}`,
  });

  console.log(result.text);

  terminal.close();
}

main();
```

**The key concepts:**
- Readline waits for user input
- The prompt is built from that input using template literals
- The model is called with the dynamic prompt
- The terminal is cleaned up with `close()`

</details>

<details>
<summary>Hint 4: Why template literals matter</summary>

Template literals (`backticks`) let you embed variables in strings:

```typescript
// With template literal
const topic = 'cats';
const prompt = `Tell me a joke about ${topic}`;
// prompt = "Tell me a joke about cats"

// Without template literal (old style, harder to read)
const prompt = 'Tell me a joke about ' + topic;
```

The first version is much clearer. Use template literals.

</details>

## DevTools (optional)

Same as the last challenge:

```bash
# In another terminal
npm run devtools
```

Open [http://localhost:4983](http://localhost:4983). When you run `npm run q0-input` and type a topic, you'll see:
- The full prompt the model received (including your topic)
- The model's response
- Token counts and timing

This helps you understand that the user's input is being embedded into the prompt correctly.

## Success criteria

You're done when:

- ✅ The program asks for input
- ✅ You can type a topic and hit enter
- ✅ The model generates a joke about that topic
- ✅ Different topics produce different jokes
- ✅ No errors
- ✅ The program exits cleanly after the joke

Once this works, you're ready for the next challenge (where the model can ask for help via tools, and you build a loop to handle that).

## Next: Why this matters

You just built an interactive program. The user's input directly shapes what the model does.

In the next challenge, the model will be able to *ask* for help via tools. You'll build a loop that lets the model call tools, get results, and call the model again. But it all works the same way: user input → prompt → model → response.

Keep this pattern in mind. Every AI app you build uses it.
