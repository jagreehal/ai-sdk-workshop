import { ollama } from 'ai-sdk-ollama';
import { wrapLanguageModel } from 'ai';
import { devToolsMiddleware } from '@ai-sdk/devtools';

const baseModel = ollama('granite4:latest');

/** Model with optional DevTools (local dev only). Set AI_SDK_DEVTOOLS=0 to disable. */
export const model =
  process.env.NODE_ENV === 'production' || process.env.AI_SDK_DEVTOOLS === '0'
    ? baseModel
    : wrapLanguageModel({
        model: baseModel,
        middleware: devToolsMiddleware(),
      });
