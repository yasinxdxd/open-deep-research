import { LanguageModelV1, EmbeddingModelV1 } from '@ai-sdk/provider';
import {
  OpenAICompatibleChatLanguageModel,
  OpenAICompatibleCompletionLanguageModel,
  OpenAICompatibleEmbeddingModel,
} from '@ai-sdk/openai-compatible';
import {
  FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { ExampleChatModelId, ExampleChatSettings } from './lite-settings';
// Import your model id and settings here.


export interface ExampleProviderSettings {
  /**
Example API key.
*/
  apiKey?: string;
  /**
Base URL for the API calls.
*/
  baseURL?: string;
  /**
Custom headers to include in the requests.
*/
  headers?: Record<string, string>;
  /**
Optional custom url query parameters to include in request urls.
*/
  queryParams?: Record<string, string>;
  /**
Custom fetch implementation. You can use it as a middleware to intercept requests,
or to provide a custom fetch implementation for e.g. testing.
*/
  fetch?: FetchFunction;
}

export interface ExampleProvider {
  /**
Creates a model for text generation.
*/
  (
    modelId: ExampleChatModelId,
    settings?: ExampleChatSettings,
  ): LanguageModelV1;

  /**
Creates a chat model for text generation.
*/
  chatModel(
    modelId: ExampleChatModelId,
    settings?: ExampleChatSettings,
  ): LanguageModelV1;

  /**
Creates a completion model for text generation.
*/
//   completionModel(
//     modelId: ExampleCompletionModelId,
//     settings?: ExampleCompletionSettings,
//   ): LanguageModelV1;

  /**
Creates a text embedding model for text generation.
*/
//   textEmbeddingModel(
//     modelId: ExampleEmbeddingModelId,
//     settings?: ExampleEmbeddingSettings,
//   ): EmbeddingModelV1<string>;
}

export function createExample(
  options: ExampleProviderSettings = {},
): ExampleProvider {
  const baseURL = withoutTrailingSlash(
    options.baseURL ?? 'https://litellm.unknownland.org/openai/deployments/gpt-35-turbo-openai',
  );
  const getHeaders = () => ({
    ...options.headers,
    'x-goog-api-key': process.env.LITELLM_API_KEY || "",
  });

  interface CommonModelConfig {
    provider: string;
    url: ({ path }: { path: string }) => string;
    headers: () => Record<string, string>;
    fetch?: FetchFunction;
  }

  const getCommonModelConfig = (modelType: string): CommonModelConfig => ({
    provider: `lite-llm.${modelType}`,
    url: ({ path }) => {
      const url = new URL(`${baseURL}${path}`);
      if (options.queryParams) {
        url.search = new URLSearchParams(options.queryParams).toString();
      }
      return url.toString();
    },
    headers: getHeaders,
    fetch: options.fetch,
  });

  const createChatModel = (
    modelId: ExampleChatModelId,
    settings: ExampleChatSettings = {},
  ) => {
    return new OpenAICompatibleChatLanguageModel(modelId, settings, {
      ...getCommonModelConfig('chat'),
    // //   fetch: (requestInfo, options) => 
    // //     fetch(requestInfo, {
    // //       ...options,
    // //       method: 'POST',
    // //       body: JSON.stringify({
            
    // //         model: "gpt-4o",
    // //         messages: [
    // //             {
    // //                 role: "assistant",
    // //                 content: "What is your name?"
    // //             }
    // //         ],
    // //         stream: true,
    // //         user: "asdiaskdaskd"
    // //       })
    // //     })
    //   ,
      defaultObjectGenerationMode: 'tool',
    });
  };

//   const createCompletionModel = (
//     modelId: ExampleCompletionModelId,
//     settings: ExampleCompletionSettings = {},
//   ) =>
//     new OpenAICompatibleCompletionLanguageModel(
//       modelId,
//       settings,
//       getCommonModelConfig('completion'),
//     );

//   const createTextEmbeddingModel = (
//     modelId: ExampleEmbeddingModelId,
//     settings: ExampleEmbeddingSettings = {},
//   ) =>
//     new OpenAICompatibleEmbeddingModel(
//       modelId,
//       settings,
//       getCommonModelConfig('embedding'),
//     );

  const provider = (
    modelId: ExampleChatModelId,
    settings?: ExampleChatSettings,
  ) => createChatModel(modelId, settings);

//   provider.completionModel = createCompletionModel;
  provider.chatModel = createChatModel;
//   provider.textEmbeddingModel = createTextEmbeddingModel;

  return provider;
}

// Export default instance
export const lite_llm = createExample();