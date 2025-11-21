import { get, set } from "idb-keyval";
import { TBaseModel, TModelKey } from "./use-model-list";
import { TToolKey } from "./use-tools";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TAssistant } from "./use-chat-session";
import { defaultSystemPrompt } from "@/lib/system-prompt";

export type TApiKeys = Partial<Record<TBaseModel, string>>;
export type TPreferences = {
  defaultAssistant: TAssistant["key"];
  systemPrompt: string;
  messageLimit: number;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  googleSearchEngineId?: string;
  googleSearchApiKey?: string;
  tavilyApiKey?: string;
  wolframAppId?: string;
  defaultPlugins: TToolKey[];
  defaultWebSearchEngine: "google" | "tavily";
  ollamaBaseUrl: string;
  memories: string[];
  ragSettings: {
    provider: "google" | "openai" | "mistral" | "cohere";
    apiKey: string;
    model: string;
    topK: number;
    chunkSize: number;
    chunkOverlap: number;
    searchType: "similarity" | "mmr";
    similarityThreshold: number;
  };
};

export const defaultPreferences: TPreferences = {
  defaultAssistant: "gemini-2.5-flash",
  systemPrompt: defaultSystemPrompt,
  messageLimit: 30,
  temperature: 0.5,
  maxTokens: 1000,
  topP: 1.0,
  topK: 5,
  defaultPlugins: [],
  defaultWebSearchEngine: "tavily",
  ollamaBaseUrl: "",
  memories: [],
  ragSettings: {
    provider: "google",
    apiKey: "",
    model: "text-embedding-004",
    topK: 4,
    chunkSize: 1000,
    chunkOverlap: 200,
    searchType: "similarity",
    similarityThreshold: 0.5,
  },
};

export const usePreferences = () => {
  const preferencesQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: () => getPreferences(),
  });

  const apiKeysQuery = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => getApiKeys(),
  });

  const setPreferencesMutation = useMutation({
    mutationFn: async (prefernces: Partial<TPreferences>) =>
      await setPreferences(prefernces),
    onSuccess() {
      console.log("refetching");
      preferencesQuery.refetch();
    },
  });

  const setApiKeyMutation = useMutation({
    mutationFn: async ({ key, value }: any) => setApiKey(key, value),
    onSuccess: () => {
      apiKeysQuery.refetch();
    },
  });

  const resetToDefaultsMutation = useMutation({
    mutationFn: () => resetToDefaults(),
    onSuccess: () => {
      preferencesQuery.refetch();
    },
  });

  const getApiKeys = async (): Promise<TApiKeys> => {
    return (await get("api-keys")) || {};
  };

  const getPreferences = async (): Promise<TPreferences> => {
    return (await get("preferences")) as TPreferences;
  };

  const setPreferences = async (preferences: Partial<TPreferences>) => {
    const currentPreferences = await getPreferences();
    const newPreferences = { ...currentPreferences, ...preferences };
    await set("preferences", newPreferences);
    return newPreferences;
  };

  const resetToDefaults = async () => {
    await set("preferences", defaultPreferences);
  };

  const setApiKey = async (key: TBaseModel, value: string) => {
    const keys = await getApiKeys();
    const newKeys = { ...keys, [key]: value };
    await set("api-keys", newKeys);
  };

  const getApiKey = async (key: TBaseModel) => {
    const keys = await getApiKeys();
    return keys[key];
  };

  return {
    getApiKeys,
    setApiKey,
    getApiKey,
    getPreferences,
    setPreferences,
    resetToDefaults,
    preferencesQuery,
    setApiKeyMutation,
    setPreferencesMutation,
    resetToDefaultsMutation,
    apiKeysQuery,
  };
};
