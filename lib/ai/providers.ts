import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
// import { xai } from '@ai-sdk/xai';
// import { createOpenAI } from '@ai-sdk/openai';
import { createVertex } from '@ai-sdk/google-vertex';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

/*
const openAiConfig = {
  baseURL: process.env.DIGITALOCEAN_API_URL as string,
  apiKey: process.env.DIGITALOCEAN_API_KEY as string,
  compatibility: 'compatible',
} as any;
const openai = createOpenAI(openAiConfig);
*/

const google = createVertex({
  project: process.env.GOOGLE_PROJECT_ID as string,
  location: process.env.GOOGLE_LOCATION as string,
  googleAuthOptions: {
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL as string,
      private_key: process.env.GOOGLE_PRIVATE_KEY as string,
    },
  },
});

const model = 'gemini-2.5-flash';

const tools = [
  {
    retrieval: {
      vertexRagStore: {
        ragResources: [
          {
            ragResource: {
              ragCorpus: `projects/${process.env.GOOGLE_PROJECT_ID}/locations/${process.env.GOOGLE_LOCATION}/ragCorpora/${process.env.GOOGLE_RAG_CORPUS_ID}`,
            },
          },
        ],
      },
    },
  },
];

// Set up generation config
const generationConfig = {
  maxOutputTokens: 65535,
  temperature: 1,
  topP: 1,
  seed: 0,
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'OFF',
    },
  ],
  tools: tools,
} as any;

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
        'chat-model': google(model, generationConfig),
        'chat-model-reasoning': wrapLanguageModel({
          model: google(model, generationConfig),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': google(model, generationConfig),
        'artifact-model': google('gemini-2.5-flash'),
      },
      /*
    languageModels: {
      'chat-model': openai('gpt-4o'),
      'chat-model-reasoning': wrapLanguageModel({
        model: openai('gpt-4o'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': openai('gpt-4o'),
      'artifact-model': openai('gpt-4o'),
    },
    */
      imageModels: {
        'small-model': openai.image('dall-e-3'),
      },
    });
