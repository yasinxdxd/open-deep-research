import { OpenAICompatibleChatSettings } from '@ai-sdk/openai-compatible';

export type ExampleChatModelId =
  | 'gpt-4o'
  | (string & {});

export interface ExampleChatSettings extends OpenAICompatibleChatSettings {
  // Add any custom settings here
}