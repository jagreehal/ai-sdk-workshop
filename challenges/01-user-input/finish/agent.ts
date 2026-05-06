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
