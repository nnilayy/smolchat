import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

declare global {
  var memoryVectorStore: MemoryVectorStore | undefined;
}

export const getVectorStore = () => global.memoryVectorStore;

export const setVectorStore = (store: MemoryVectorStore) => {
  global.memoryVectorStore = store;
};

export const clearVectorStore = () => {
  global.memoryVectorStore = undefined;
};
