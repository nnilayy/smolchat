import { ModelIcon } from "@/components/model-icon";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { defaultPreferences } from "./use-preferences";
import { TToolKey } from "./use-tools";
import { usePreferenceContext } from "@/context";
import { useQuery } from "@tanstack/react-query";
import { ChatOllama } from "@langchain/ollama";
import { useMemo } from "react";
import { TAssistant } from "./use-chat-session";
import { useAssistants } from "./use-bots";

export type TBaseModel = "openai" | "anthropic" | "gemini" | "ollama";

export const models = [
  "gpt-4o",
  "gpt-4",
  "gpt-4-turbo",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-instruct",
  "claude-opus-4-1-20250805",
  "claude-sonnet-4-5-20250929",
  "claude-haiku-4-5-20251001",
  "gemini-3-pro-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

export type TModelKey = (typeof models)[number] | string;

export type TModel = {
  name: string;
  key: TModelKey;
  isNew?: boolean;
  icon: (size: "sm" | "md" | "lg") => JSX.Element;
  inputPrice?: number;
  outputPrice?: number;
  tokens: number;
  plugins: TToolKey[];
  baseModel: TBaseModel;
  maxOutputTokens: number;
};

export const useModelList = () => {
  const { preferences } = usePreferenceContext();
  const assistantsProps = useAssistants();
  const ollamaModelsQuery = useQuery({
    queryKey: ["ollama-models"],
    queryFn: () =>
      fetch(`${preferences.ollamaBaseUrl}/api/tags`).then((res) => res.json()),
    enabled: !!preferences,
  });

  const createInstance = async (model: TModel, apiKey: string) => {
    const temperature =
      preferences.temperature || defaultPreferences.temperature;
    const topP = preferences.topP || defaultPreferences.topP;
    const topK = preferences.topK || defaultPreferences.topK;
    const maxTokens = preferences.maxTokens || model.tokens;
    switch (model.baseModel) {
      case "openai":
        return new ChatOpenAI({
          model: model.key,
          streaming: true,
          apiKey,
          temperature,
          maxTokens,
          topP,
          maxRetries: 2,
        });
      case "anthropic":
        return new ChatAnthropic({
          model: model.key,
          streaming: true,
          anthropicApiUrl: `${window.location.origin}/api/anthropic/`,
          apiKey,
          maxTokens,
          temperature,
          topP,
          topK,
          maxRetries: 2,
        });
      case "gemini":
        return new ChatGoogleGenerativeAI({
          model: model.key,
          apiKey,
          maxOutputTokens: maxTokens,
          streaming: true,
          temperature,
          maxRetries: 1,
          onFailedAttempt: (error) => {
            console.error("Failed attempt", error);
          },
          topP,
          topK,
        });
      case "ollama":
        return new ChatOllama({
          model: model.key,
          baseUrl: preferences.ollamaBaseUrl,
          topK,
          numPredict: maxTokens,
          topP,
          maxRetries: 2,
          temperature,
        });
      default:
        throw new Error("Invalid model");
    }
  };
  const models: TModel[] = [
    {
      name: "GPT 4o",
      key: "gpt-4o",
      tokens: 128000,
      isNew: true,
      inputPrice: 5,
      outputPrice: 15,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      icon: (size) => <ModelIcon size={size} type="openai" />,
      baseModel: "openai",
      maxOutputTokens: 2048,
    },
    {
      name: "GPT4 Turbo",
      key: "gpt-4-turbo",
      tokens: 128000,
      isNew: false,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      inputPrice: 10,
      outputPrice: 30,
      icon: (size) => <ModelIcon size={size} type="openai" />,
      baseModel: "openai",
      maxOutputTokens: 4095,
    },
    {
      name: "GPT4",
      key: "gpt-4",
      tokens: 128000,
      isNew: false,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      inputPrice: 30,
      outputPrice: 60,
      icon: (size) => <ModelIcon size={size} type="openai" />,
      baseModel: "openai",
      maxOutputTokens: 4095,
    },
    {
      name: "GPT3.5 Turbo",
      key: "gpt-3.5-turbo",
      isNew: false,
      inputPrice: 0.5,
      outputPrice: 1.5,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      tokens: 16385,
      icon: (size) => <ModelIcon size={size} type="openai" />,
      baseModel: "openai",
      maxOutputTokens: 4095,
    },
    {
      name: "GPT3.5 Turbo 0125",
      key: "gpt-3.5-turbo-0125",
      isNew: false,
      tokens: 16385,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      icon: (size) => <ModelIcon size={size} type="openai" />,
      baseModel: "openai",
      maxOutputTokens: 4095,
    },
    {
      name: "GPT3.5 Turbo Instruct",
      key: "gpt-3.5-turbo-instruct",
      isNew: false,
      tokens: 4000,
      inputPrice: 1.5,
      outputPrice: 2,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      icon: (size) => <ModelIcon size={size} type="openai" />,
      baseModel: "openai",
      maxOutputTokens: 4095,
    },
    {
      name: "Claude Opus 4.1",
      key: "claude-opus-4-1-20250805",
      isNew: true,
      inputPrice: 15,
      outputPrice: 75,
      tokens: 200000,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      icon: (size) => <ModelIcon size={size} type="anthropic" />,
      maxOutputTokens: 4095,

      baseModel: "anthropic",
    },
    {
      name: "Claude Sonnet 4.5",
      inputPrice: 3,
      outputPrice: 15,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      key: "claude-sonnet-4-5-20250929",
      isNew: true,
      maxOutputTokens: 4095,
      tokens: 200000,
      icon: (size) => <ModelIcon size={size} type="anthropic" />,

      baseModel: "anthropic",
    },
    {
      name: "Claude Haiku 4.5",
      key: "claude-haiku-4-5-20251001",
      isNew: true,
      inputPrice: 0.25,
      outputPrice: 1.5,
      tokens: 200000,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      maxOutputTokens: 4095,
      icon: (size) => <ModelIcon size={size} type="anthropic" />,
      baseModel: "anthropic",
    },
    {
      name: "Gemini 3 Pro",
      key: "gemini-3-pro-preview",
      isNew: true,
      inputPrice: 0,
      outputPrice: 0,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      tokens: 1048576,
      icon: (size) => <ModelIcon size={size} type="gemini" />,
      baseModel: "gemini",
      maxOutputTokens: 65536,
    },
    {
      name: "Gemini 2.5 Pro",
      key: "gemini-2.5-pro",
      isNew: true,
      inputPrice: 0,
      outputPrice: 0,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      tokens: 1048576,
      icon: (size) => <ModelIcon size={size} type="gemini" />,
      baseModel: "gemini",
      maxOutputTokens: 65536,
    },
    {
      name: "Gemini 2.5 Flash",
      key: "gemini-2.5-flash",
      isNew: true,
      inputPrice: 0,
      outputPrice: 0,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      tokens: 1048576,
      icon: (size) => <ModelIcon size={size} type="gemini" />,
      baseModel: "gemini",
      maxOutputTokens: 65536,
    },
    {
      name: "Gemini 2.5 Flash-Lite",
      key: "gemini-2.5-flash-lite",
      isNew: true,
      inputPrice: 0,
      outputPrice: 0,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      tokens: 1048576,
      icon: (size) => <ModelIcon size={size} type="gemini" />,
      baseModel: "gemini",
      maxOutputTokens: 65536,
    },
    {
      name: "Gemini 2.0 Flash",
      key: "gemini-2.0-flash",
      isNew: false,
      inputPrice: 0,
      outputPrice: 0,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      tokens: 1048576,
      icon: (size) => <ModelIcon size={size} type="gemini" />,
      baseModel: "gemini",
      maxOutputTokens: 8192,
    },
    {
      name: "Gemini 2.0 Flash-Lite",
      key: "gemini-2.0-flash-lite",
      isNew: false,
      inputPrice: 0,
      outputPrice: 0,
      plugins: ["web_search", "memory", "retrieval_tool", "youtube_tool", "wolfram_tool", "web_reader_tool"],
      tokens: 1048576,
      icon: (size) => <ModelIcon size={size} type="gemini" />,
      baseModel: "gemini",
      maxOutputTokens: 8192,
    },
  ];

  const allModels: TModel[] = useMemo(
    () => [
      ...models,
      ...(ollamaModelsQuery.data?.models?.map(
        (model: any): TModel => ({
          name: model.name,
          key: model.name,
          tokens: 128000,
          inputPrice: 0,
          outputPrice: 0,
          plugins: [],
          icon: (size) => <ModelIcon size={size} type="ollama" />,
          baseModel: "ollama",
          maxOutputTokens: 2048,
        })
      ) || []),
    ],
    [ollamaModelsQuery.data?.models]
  );

  const getModelByKey = (key: TModelKey) => {
    return allModels.find((model) => model.key === key);
  };

  const getTestModelKey = (key: TBaseModel): TModelKey => {
    switch (key) {
      case "openai":
        return "gpt-4o";
      case "anthropic":
        return "claude-haiku-4-5-20251001";
      case "gemini":
        return "gemini-2.5-flash";
      case "ollama":
        return "phi3:latest";
    }
  };

  const assistants: TAssistant[] = [
    ...allModels?.map(
      (model): TAssistant => ({
        name: model.name,
        key: model.key,
        baseModel: model.key,
        type: "base",
        systemPrompt:
          preferences.systemPrompt || defaultPreferences.systemPrompt,
      })
    ),
    ...(assistantsProps?.assistantsQuery?.data || []),
  ];

  const getAssistantByKey = (
    key: string
  ): { assistant: TAssistant; model: TModel } | undefined => {
    const assistant = assistants.find((assistant) => assistant.key === key);
    if (!assistant) {
      return;
    }

    const model = getModelByKey(assistant?.baseModel);

    if (!model) {
      return;
    }

    return {
      assistant,
      model,
    };
  };

  const getAssistantIcon = (assistantKey: string) => {
    const assistant = getAssistantByKey(assistantKey);
    return assistant?.assistant.type === "base" ? (
      assistant?.model?.icon("sm")
    ) : (
      <ModelIcon type="custom" size="sm" />
    );
  };

  return {
    models: allModels,
    createInstance,
    getModelByKey,
    getTestModelKey,
    getAssistantIcon,
    assistants,
    getAssistantByKey,
    ...assistantsProps,
  };
};
