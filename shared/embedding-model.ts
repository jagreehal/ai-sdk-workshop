import { ollama } from 'ai-sdk-ollama';

export const embeddingModel = ollama.embedding('embeddinggemma:latest');
