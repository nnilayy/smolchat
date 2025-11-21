import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { Embeddings } from "@langchain/core/embeddings";

export const getPineconeStore = async (
  embeddings: Embeddings,
  config: {
    pineconeApiKey: string;
    pineconeIndex: string;
    namespace: string;
  }
) => {
  const { pineconeApiKey, pineconeIndex, namespace } = config;

  if (!pineconeApiKey || !pineconeIndex) {
    throw new Error("Pinecone API Key and Index Name are required");
  }

  const pinecone = new Pinecone({
    apiKey: pineconeApiKey,
  });

  const index = pinecone.Index(pineconeIndex);

  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace,
  });
};
