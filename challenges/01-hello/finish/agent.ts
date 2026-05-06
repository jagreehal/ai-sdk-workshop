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
