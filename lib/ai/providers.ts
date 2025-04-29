import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
// import { xai } from '@ai-sdk/xai';
import { createOpenAI } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

const openAiConfig = {
  baseURL: process.env.DIGITALOCEAN_API_URL as string,
  apiKey: process.env.DIGITALOCEAN_API_KEY as string,
  compatibility: 'compatible',
} as any;
const openai = createOpenAI(openAiConfig);

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
    /*
      languageModels: {
        'chat-model': xai('grok-2-vision-1212'),
        'chat-model-reasoning': wrapLanguageModel({
          model: xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': xai('grok-2-1212'),
        'artifact-model': xai('grok-2-1212'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
      },
      */
    languageModels: {
      'chat-model': openai('gpt-4o'),
      'chat-model-reasoning': wrapLanguageModel({
        model: openai('gpt-4o'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': openai('gpt-4o'),
      'artifact-model': openai('gpt-4o'),
    },
    imageModels: {
      'small-model': openai.image('dall-e-3'),
    },
    });
