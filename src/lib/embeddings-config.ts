export const EMBEDDING_PROVIDERS = [
  {
    id: "google",
    name: "Google Gemini",
    getApiKeyUrl: "https://aistudio.google.com/app/apikey",
    models: [
      { id: "text-embedding-004", name: "Text Embedding 004" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    getApiKeyUrl: "https://platform.openai.com/settings/organization/api-keys",
    models: [
      { id: "text-embedding-3-small", name: "Text Embedding 3 Small" },
      { id: "text-embedding-3-large", name: "Text Embedding 3 Large" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    getApiKeyUrl: "https://admin.mistral.ai/organization/api-keys",
    models: [
      { id: "mistral-embed", name: "Mistral Embed" },
    ],
  },
  {
    id: "cohere",
    name: "Cohere",
    getApiKeyUrl: "https://dashboard.cohere.com/api-keys",
    models: [
      { id: "embed-english-v3.0", name: "Embed English v3.0" },
      { id: "embed-multilingual-v3.0", name: "Embed Multilingual v3.0" },
    ],
  },
] as const;

export type EmbeddingProviderId = typeof EMBEDDING_PROVIDERS[number]["id"];
