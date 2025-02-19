
import { LanguageModelV1, LanguageModelV1CallOptions, LanguageModelV1Prompt, generateText } from 'ai';

class CustomCompletionLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = "v1";
  readonly defaultObjectGenerationMode = undefined;
  public provider: string;

  constructor(
    public modelId: string,
    public settings: any,
    private config: any
  ) {
    this.provider = config.provider;
  }

  supportsImageUrls?: boolean;
  supportsStructuredOutputs?: boolean;

  supportsUrl?(url: URL): boolean {
    return false;
  }

  async doGenerate(options: LanguageModelV1CallOptions): Promise<any> {
    try {
      console.log('Making request to:', this.config.url({ modelId: this.modelId, path: '/engines/gpt-4/chat/completions' }));

      const headers = {
        ...this.config.headers(),
        'Content-Type': 'application/json',
      };
      const body = {
        "model": "gpt-4o",
        "messages": [
          {
            "role": options.prompt[0].role,
            "content": options.prompt[0].content
          },
          {
            "role": options.prompt[1].role,
            "content": options.prompt[1].content
          }
        ],
      };
      console.log('Headers:', headers);
      console.log('Body:', JSON.stringify(body));
      console.log('options: ', options);
      // { prompt: options.prompt, settings: this.settings }
  
      const response = await fetch(this.config.url({ modelId: this.modelId, path: '/engines/gpt-4/chat/completions' }), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Network response was not ok: ${response.statusText}, Details: ${errorDetails}`);
      }
  
      const res = await response.json();
      console.log(res);
      console.log(res.choices[0].message);
      return res;
    } catch (error) {
      console.error('Error in doGenerate:', error);
      throw error;
    }
  }

  async doStream(options: any): Promise<any> {
    throw new Error('Streaming not implemented in this example');
  }
}

type CustomProvider = {
  languageModel: (modelId: string, settings?: any) => CustomCompletionLanguageModel;
};

function createCustomProvider(config: any): CustomProvider {
  return {
    languageModel: (modelId, settings = {}) => {
      return new CustomCompletionLanguageModel(modelId, settings, config);
    },
  };
}

const config = {
  provider: 'customProvider',
  compatibility: 'compatible',
  headers: () => ({
    'x-goog-api-key': process.env.LITELLM_API_KEY,
  }),
  url: ({ modelId, path }: { modelId: string, path: string }) => `https://litellm.unknownland.org${path}`,
};

const customProvider = createCustomProvider(config);

  // export async function generateTextExample() {
  //   const prompt: LanguageModelV1Prompt = [
  //     { role: 'system', content: 'You are a friendly assistant.' },
  //     { role: 'user', content: [{ text: 'Why is the sky blue?', type: "text" }] }  // Ensure you use proper types here
  //   ];

  //   const callOptions: LanguageModelV1CallOptions = { 
  //     prompt,
  //     inputFormat: 'messages',  // Choose 'messages' or 'prompt' based on your needs
  //     mode: {
  //       type: 'regular',  // Adjust this according to your context ('regular', 'object-json', 'object-tool')
  //       tools: [],        // Provide tools if necessary
  //       // toolChoice: 'auto',  // Set toolChoice if needed
  //     },
  //     providerMetadata: {}, // Add any provider-specific metadata if needed
  //   };

  //   const model = customProvider.languageModel('gpt-4');

  //   const { text } = await generateText({
  //     model: model,
  //     prompt: 'Why is the sky blue?',
  //   });

  //   return text;
  // }

  // export const liteLLMmodel = customProvider.languageModel('gpt-4');
export function liteLLMmodel(modelId: string) {
  return new CustomCompletionLanguageModel(modelId, {}, config);
}
