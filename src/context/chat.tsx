"use client";
import { useToast } from "@/components/ui/use-toast";
import { TToolResponse, defaultPreferences, useTools } from "@/hooks";
import {
  TAssistant,
  TChatMessage,
  TLLMInputProps,
} from "@/hooks/use-chat-session";
import { useModelList } from "@/hooks/use-model-list";
import { removeExtraSpaces, sortMessages } from "@/lib/helper";
import { DisableEnter, ShiftEnterToLineBreak } from "@/lib/tiptap-extension";
import type { Serialized } from "@langchain/core/load/serializable";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { LLMResult } from "@langchain/core/outputs";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Highlight } from "@tiptap/extension-highlight";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import { useEditor } from "@tiptap/react";
import moment from "moment";
import { createContext, useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { usePreferenceContext } from "./preferences";
import { useSessionsContext } from "./sessions";
import { useSettingsContext } from "./settings";
import { useDocumentContext } from "./documents";
import { memoryTool } from "@/tools/memory";

export type TChatContext = {
  editor: ReturnType<typeof useEditor>;
  sendMessage: () => void;
  handleRunModel: (props: TLLMInputProps, clear?: () => void) => void;
  contextValue: string;
  isGenerating: boolean;
  setContextValue: (value: string) => void;
  stopGeneration: () => void;
};

export const ChatContext = createContext<undefined | TChatContext>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export type TChatProvider = {
  children: React.ReactNode;
};

export const ChatProvider = ({ children }: TChatProvider) => {
  const {
    setCurrentSession,
    refetchSessions,
    currentSession,
    addMessageToSession,
  } = useSessionsContext();
  const { getAssistantByKey } = useModelList();
  const [contextValue, setContextValue] = useState("");
  const { open: openSettings } = useSettingsContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<TChatMessage>();
  const [currentTools, setCurrentTools] = useState<TToolResponse[]>([]);
  const { getSessionById, updateSessionMutation } = useSessionsContext();
  const { apiKeys, preferences, updatePreferences } = usePreferenceContext();
  const { createInstance, getModelByKey } = useModelList();
  const { toast } = useToast();
  const { getToolByKey } = useTools();
  const { documents, clearDocuments } = useDocumentContext();

  const [abortController, setAbortController] = useState<AbortController>();

  const updateCurrentMessage = (update: Partial<TChatMessage>) => {
    setCurrentMessage((prev) => {
      if (!!prev) {
        return {
          ...prev,
          ...update,
        };
      }
      return prev;
    });
  };

  useEffect(() => {
    const props = currentMessage;

    props &&
      setCurrentSession?.((session) => {
        if (!session) return undefined;
        const exisingMessage = session.messages.find(
          (message) => message.id === props.id
        );
        if (exisingMessage) {
          return {
            ...session,
            messages: session.messages.map((message) => {
              if (message.id === props.id) {
                return { message, ...{ ...props, tools: currentTools } };
              }
              return message;
            }),
          };
        }

        return {
          ...session,
          messages: [...session.messages, { ...props, tools: currentTools }],
        };
      });

    if (currentMessage?.stop) {
      currentMessage?.sessionId &&
        addMessageToSession(currentMessage?.sessionId, {
          ...currentMessage,
          isLoading: false,
          tools: currentTools?.map((t) => ({ ...t, toolLoading: false })),
        });
      setIsGenerating(false);
    }
  }, [currentMessage, currentTools]);

  const stopGeneration = () => {
    abortController?.abort("cancel");
  };

  const preparePrompt = async ({
    context,
    image,
    history,
    assistant,
  }: {
    context?: string;
    image?: string;
    history: TChatMessage[];
    assistant: TAssistant;
  }) => {
    const hasPreviousMessages = history?.length > 0;
    const systemPrompt = assistant.systemPrompt;

    const finalSystemPrompt = `${systemPrompt}\n Things to remember: \n ${preferences.memories.join(
      "\n"
    )}\n ${
      hasPreviousMessages
        ? `You can also refer to these previous conversations`
        : ``
    }`;

    const system: BaseMessagePromptTemplateLike = [
      "system",
      finalSystemPrompt,
    ];

    const messageHolders = new MessagesPlaceholder("chat_history");

    const userContent = `{input}\n\n${
      context
        ? `Answer user's question based on the following context: """{context}"""`
        : ``
    } `;

    const user: BaseMessagePromptTemplateLike = [
      "user",
      image
        ? [
            {
              type: "text",
              content: userContent,
            },
            {
              type: "image_url",
              image_url: image,
            },
          ]
        : userContent,
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      system,
      messageHolders,
      user,
      ["placeholder", "{agent_scratchpad}"],
    ]);

    return { prompt, systemPrompt: finalSystemPrompt };
  };

  const runModel = async (props: TLLMInputProps) => {
    setIsGenerating(true);
    setCurrentMessage(undefined);
    setCurrentTools([]);

    const { sessionId, messageId, input, context, image, assistant } = props;
    const currentAbortController = new AbortController();
    setAbortController(currentAbortController);
    const selectedSession = await getSessionById(sessionId);

    if (!input) {
      return;
    }

    const newMessageId = messageId || v4();
    const modelKey = assistant.baseModel;

    const allPreviousMessages =
      selectedSession?.messages?.filter((m) => m.id !== messageId) || [];
    const chatHistory = sortMessages(allPreviousMessages, "createdAt");
    const plugins = preferences.defaultPlugins || [];
    const messageLimit =
      preferences.messageLimit || defaultPreferences.messageLimit;

    setCurrentMessage({
      inputProps: props,
      id: newMessageId,
      sessionId,
      rawHuman: input,
      createdAt: moment().toISOString(),
      isLoading: true,
      files: props.files,
    });

    const selectedModelKey = getModelByKey(modelKey);
    if (!selectedModelKey) {
      throw new Error("Model not found");
    }

    const apiKey = apiKeys[selectedModelKey?.baseModel];

    if (!apiKey) {
      updateCurrentMessage({
        isLoading: false,
        stop: true,
        stopReason: "apikey",
      });
      toast({
        title: "API Key Missing",
        description: `Please add an API key for ${
          selectedModelKey?.name || "the selected model"
        }`,
        variant: "destructive",
      });
      openSettings("models", selectedModelKey?.baseModel);
      return;
    }

    const { prompt, systemPrompt } = await preparePrompt({
      context: context,
      image,
      history:
        selectedSession?.messages?.filter((m) => m.id !== messageId) || [],
      assistant,
    });

    const availableTools =
      selectedModelKey?.plugins
        ?.filter((p) => {
          return plugins.includes(p);
        })
        ?.map((p) =>
          getToolByKey(p)?.tool({
            updatePreferences,
            preferences,
            apiKeys,
            sendToolResponse: (arg: TToolResponse) => {
              setCurrentTools((tools) =>
                tools.map((t) => {
                  if (t.toolName === arg.toolName) {
                    return {
                      ...arg,
                      toolLoading: false,
                    };
                  }
                  return t;
                })
              );
            },
          })
        )
        ?.filter((t): t is any => !!t) || [];

    console.log("Available tools", availableTools);

    const selectedModel = await createInstance(selectedModelKey, apiKey);

    const previousAllowedChatHistory = chatHistory
      .slice(0, messageLimit)
      .reduce(
        (acc: any[], { rawAI, rawHuman, image }) => {
          if (rawAI && rawHuman) {
            return [
              ...acc,
              { role: "user", content: rawHuman },
              { role: "assistant", content: rawAI },
            ];
          } else {
            return [...acc];
          }
        },
        []
      );

    let streamedMessage = "";

    try {
      // Call the API route that uses createAgent
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...previousAllowedChatHistory,
            { role: "user", content: input },
          ],
          model: selectedModelKey.key,
          apiKey: apiKey,
          baseModel: selectedModelKey.baseModel,
          tools: availableTools.map((t) => t.name === "retrieval_tool" ? "retrieval_tool" : t.name),
          searchPreferences: {
            engine: preferences.defaultWebSearchEngine,
            googleApiKey: preferences.googleSearchApiKey,
            googleEngineId: preferences.googleSearchEngineId,
            tavilyApiKey: preferences.tavilyApiKey,
            wolframAppId: preferences.wolframAppId,
          },
          systemPrompt: systemPrompt,
        }),
        signal: currentAbortController?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `API error: ${response.status}`);
        (error as any).details = errorData.details;
        throw error;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === "content") {
              streamedMessage += data.content;
              updateCurrentMessage({
                isLoading: true,
                rawAI: streamedMessage,
                stop: false,
                stopReason: undefined,
              });
            } else if (data.type === "tool_calls") {
              // Handle tool calls
              data.tool_calls.forEach((toolCall: any) => {
                // Map tool name if necessary (e.g. document_search -> retrieval_tool)
                let toolName = toolCall.name;
                if (toolName === "document_search") toolName = "retrieval_tool";
                if (toolName === "wolfram_alpha") toolName = "wolfram_tool";
                
                setCurrentTools((tools) => {
                  // Check if tool is already in the list to avoid duplicates
                  if (tools.some(t => t.toolName === toolName)) {
                    return tools;
                  }
                  return [
                    ...tools,
                    { toolName: toolName, toolLoading: true },
                  ];
                });

                if (toolName === "memory") {
                  const toolInstance = memoryTool({
                    apiKeys,
                    preferences,
                    updatePreferences,
                    sendToolResponse: (response) => {
                      setCurrentTools((tools) =>
                        tools.map((t) => {
                          if (t.toolName === "memory") {
                            return { ...response, toolLoading: false };
                          }
                          return t;
                        })
                      );
                    },
                  });
                  toolInstance.func(toolCall.args);
                }
              });
            } else if (data.type === "error") {
              const error = new Error(data.error || "Stream error");
              (error as any).details = data.details;
              throw error;
            }
          } catch (e) {
            console.error("Failed to parse chunk:", e);
          }
        }
      }

      updateCurrentMessage({
        isLoading: false,
        stop: true,
        stopReason: "finish",
      });
    
    } catch (err) {
      updateCurrentMessage({
        isLoading: false,
        stop: true,
        stopReason: "error",
        errorMessage: err instanceof Error ? err.message : String(err),
        errorDetails: (err as any).details,
      });
      console.error(err);
    }
  };

  const generateTitleForSession = async (sessionId: string) => {
    const session = await getSessionById(sessionId);
    const assistant = getAssistantByKey(preferences.defaultAssistant);
    if (!assistant) {
      return;
    }

    const apiKey = apiKeys[assistant.model.baseModel];

    const selectedModel = await createInstance(assistant.model, apiKey!);

    const firstMessage = session?.messages?.[0];

    if (
      !firstMessage ||
      !firstMessage.rawAI ||
      !firstMessage.rawHuman ||
      session?.messages?.length > 2
    ) {
      return;
    }

    const template = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("message"),
      [
        "user",
        "Make this prompt clear and consise? You must strictly answer with only the title, no other text is allowed.\n\nAnswer in English.",
      ],
    ]);

    try {
      const prompt = await template.formatMessages({
        message: [new HumanMessage(firstMessage.rawHuman)],
      });

      const generation = await selectedModel.invoke(prompt as any, {});

      const newTitle = generation?.content?.toString() || session.title;
      await updateSessionMutation.mutate({
        sessionId,
        session: newTitle
          ? { title: newTitle, updatedAt: moment().toISOString() }
          : {},
      });
    } catch (e) {
      console.error(e);
      return firstMessage.rawHuman;
    }
  };

  const handleRunModel = async (props: TLLMInputProps, clear?: () => void) => {
    if (!props?.input) {
      return;
    }

    const assitantprops = getAssistantByKey(props?.assistant.key);

    if (!assitantprops) {
      return;
    }

    const apiKey = apiKeys[assitantprops.model.baseModel];

    if (!apiKey && assitantprops.model.baseModel !== "ollama") {
      toast({
        title: "Ahh!",
        description: "API key is missing. Please check your settings.",
        variant: "destructive",
      });
      openSettings("models", assitantprops.model.baseModel);
      return;
    }

    setContextValue("");
    clear?.();
    await runModel({
      sessionId: props?.sessionId?.toString(),
      input: removeExtraSpaces(props?.input),
      context: removeExtraSpaces(props?.context),
      image: props?.image,
      assistant: assitantprops.assistant,
      messageId: props?.messageId,
      files: props?.files,
    });
    refetchSessions?.();
  };

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Ask smolchat anything...",
      }),
      ShiftEnterToLineBreak,
      Highlight.configure({
        HTMLAttributes: {
          class: "prompt-highlight",
        },
      }),
      HardBreak,
      DisableEnter,
    ],
    content: ``,
    autofocus: true,
    onTransaction(props) {
      const { editor } = props;
      const text = editor.getText();
      const html = editor.getHTML();
      
      const newHTML = html.replace(
        /{{{{(.*?)}}}}/g,
        ` <mark class="prompt-highlight">$1</mark> `
      );

      if (newHTML !== html) {
        editor.commands.setContent(newHTML, true, {
          preserveWhitespace: true,
        });
      }
    },

    parseOptions: {
      preserveWhitespace: "full",
    },
  });

  const sendMessage = async () => {
    if (!editor || !currentSession?.id) {
      return;
    }
    const props = getAssistantByKey(preferences.defaultAssistant);
    if (!props) {
      return;
    }

    if (documents.length > 0) {
      const formData = new FormData();
      documents.forEach((doc) => {
        formData.append("files", doc.file);
      });

      // Add RAG settings
      const { ragSettings } = preferences;
      formData.append("provider", ragSettings.provider);
      formData.append("apiKey", ragSettings.apiKey);
      formData.append("model", ragSettings.model);
      formData.append("chunkSize", ragSettings.chunkSize.toString());
      formData.append("chunkOverlap", ragSettings.chunkOverlap.toString());

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Upload failed");
        }

        toast({
          title: "Documents Processed",
          description: "Files uploaded and embedded successfully.",
        });
      } catch (error: any) {
        console.error("Upload failed", error);
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload files. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    handleRunModel(
      {
        input: editor.getText(),
        context: contextValue,
        sessionId: currentSession?.id?.toString(),
        assistant: props.assistant,
        files: documents.map((doc) => ({
          name: doc.file.name,
          type: doc.file.type,
        })),
      },
      () => {
        editor.commands.clearContent();
        editor.commands.insertContent("");
        editor.commands.focus("end");
        clearDocuments();
      }
    );
  };
  return (
    <ChatContext.Provider
      value={{
        editor,
        sendMessage,
        handleRunModel,
        contextValue,
        isGenerating,
        setContextValue,
        stopGeneration,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
