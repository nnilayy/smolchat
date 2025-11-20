import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { CohereEmbeddings } from "@langchain/cohere";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { Embeddings } from "@langchain/core/embeddings";

export type EmbeddingProvider = "google" | "openai" | "mistral" | "cohere";

export interface EmbeddingsConfig {
  provider: EmbeddingProvider;
  apiKey: string;
  model?: string;
}

export const createEmbeddings = (config: EmbeddingsConfig): Embeddings => {
  const { provider, apiKey, model } = config;

  if (!apiKey) {
    throw new Error(`API key is required for provider: ${provider}`);
  }

  switch (provider) {
    case "google":
      return new GoogleGenerativeAIEmbeddings({
        apiKey,
        modelName: model || "text-embedding-004",
      });
    case "openai":
      return new OpenAIEmbeddings({
        openAIApiKey: apiKey,
        modelName: model || "text-embedding-3-small",
      });
    case "mistral":
      return new MistralAIEmbeddings({
        apiKey,
        modelName: model || "mistral-embed",
      });
    case "cohere":
      return new CohereEmbeddings({
        apiKey,
        model: model || "embed-english-v3.0",
      });
    default:
      throw new Error(`Unsupported embedding provider: ${provider}`);
  }
};
