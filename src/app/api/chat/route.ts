import { NextRequest, NextResponse } from "next/server";
import { createAgent } from "langchain";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { TavilySearch } from "@langchain/tavily";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";
import { getVectorStore } from "@/lib/memory-store";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { WolframAlphaTool } from "@langchain/community/tools/wolframalpha";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      model,
      apiKey: rawApiKey,
      baseModel,
      tools: toolNames = [],
      searchPreferences = {},
      systemPrompt,
      signal,
    } = body;

    const apiKey = rawApiKey?.trim() || undefined;

    console.log("API Request:", {
      model,
      baseModel,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      apiKeyStart: apiKey?.substring(0, 3),
      apiKeyEnd: apiKey?.substring(apiKey.length - 3),
    });

    // Instantiate tools
    const tools = [];
    if (toolNames.includes("web_search")) {
      console.log("Search Engine Preference:", searchPreferences.engine);
      
      if (searchPreferences.engine === "google") {
        tools.push(
          new DynamicStructuredTool({
            name: "web_search",
            description: "Search the web using Google",
            schema: z.object({ input: z.string() }),
            func: async ({ input }) => {
              if (!searchPreferences.googleApiKey || !searchPreferences.googleEngineId) {
                return "Error: Google API key or Engine ID missing. Please check your settings.";
              }
              try {
                const response = await axios.get(
                  "https://www.googleapis.com/customsearch/v1",
                  {
                    params: {
                      key: searchPreferences.googleApiKey,
                      cx: searchPreferences.googleEngineId,
                      q: input,
                    },
                  }
                );
                return response.data.items
                  .map((item: any) => `${item.title}\n${item.link}\n${item.snippet}`)
                  .join("\n\n");
              } catch (e: any) {
                return `Error performing Google search: ${e.message}. Ask user to check API keys.`;
              }
            },
          })
        );
      } else {
        // Default to Tavily if engine is 'tavily' or undefined
        tools.push(
          new DynamicStructuredTool({
            name: "web_search",
            description: "A web search tool that provides access to real-time information and fact verification. Use this tool whenever you feel unconfident about an answer, need to verify facts, or require external information to provide a complete response. If you think a search might help confirm details or provide better context, do not hesitate to use this tool. Input should be a search query.",
            schema: z.object({ input: z.string() }),
            func: async ({ input }) => {
              console.log("[Tavily] Tool called with input:", input);
              try {
                const apiKey = searchPreferences.tavilyApiKey || process.env.TAVILY_API_KEY;
                if (!apiKey) {
                  console.error("[Tavily] API key missing");
                  return "Error: Tavily API key missing. Please check your settings.";
                }
                
                const tool = new TavilySearch({ maxResults: 5, tavilyApiKey: apiKey });
                
                // Add timeout to prevent hanging
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error("Tavily search timed out")), 10000)
                );
                
                const resultPromise = tool.invoke({ query: input });
                const results = await Promise.race([resultPromise, timeoutPromise]);
                
                console.log("[Tavily] Results received");
                return JSON.stringify(results);
              } catch (e: any) {
                console.error("[Tavily] Search error:", e);
                return `Error performing Tavily search: ${e.message}`;
              }
            },
          })
        );
      }
    }

    if (toolNames.includes("web_reader_tool")) {
      tools.push(
        new DynamicStructuredTool({
          name: "web_reader_tool",
          description: "Read and extract content from specific web pages. Use this tool when the user provides one or more URLs and asks to read, summarize, or extract information from them.",
          schema: z.object({
            urls: z.array(z.string()).describe("The list of URLs to read."),
          }),
          func: async ({ urls }) => {
            try {
              const results = await Promise.all(
                urls.map(async (url: string) => {
                  try {
                    const loader = new CheerioWebBaseLoader(url);
                    const docs = await loader.load();
                    return `URL: ${url}\nContent: ${docs[0].pageContent}`;
                  } catch (e: any) {
                    return `Error reading ${url}: ${e.message}`;
                  }
                })
              );
              return results.join("\n\n");
            } catch (e: any) {
              return `Error reading web pages: ${e.message}`;
            }
          },
        })
      );
    }

    if (toolNames.includes("retrieval_tool")) {
      tools.push(
        new DynamicStructuredTool({
          name: "retrieval_tool",
          description:
            "Search for information in the uploaded documents. Use this tool to answer questions about the user's files.",
          schema: z.object({ input: z.string() }),
          func: async ({ input }) => {
            console.log("[Retrieval] Tool called with input:", input);
            try {
              const vectorStore = getVectorStore();
              if (!vectorStore) {
                console.log("[Retrieval] No vector store found.");
                return "No documents found. Please upload a file first.";
              }

              console.log("[Retrieval] Vector store found. Searching...");
              const results = await vectorStore.similaritySearch(input, 4);
              console.log(`[Retrieval] Found ${results.length} docs.`);
              return results.map((doc) => doc.pageContent).join("\n\n");
            } catch (e: any) {
              console.error("[Retrieval] Error:", e);
              return `Error: ${e.message}`;
            }
          },
        })
      );
    }

    if (toolNames.includes("youtube_tool")) {
      tools.push(
        new DynamicStructuredTool({
          name: "youtube_tool",
          description: "Extracts transcripts and video information from YouTube videos. Use this tool when the user provides a YouTube video URL.",
          schema: z.object({ input: z.string() }),
          func: async ({ input }) => {
            console.log("[YouTube] Tool called with input:", input);
            try {
              // Basic validation for YouTube URL
              if (!input.includes("youtube.com") && !input.includes("youtu.be")) {
                 return "Error: Invalid YouTube URL provided.";
              }

              const loader = YoutubeLoader.createFromUrl(input, {
                language: "en",
                addVideoInfo: true,
              });

              const docs = await loader.load();
              console.log(`[YouTube] Found ${docs.length} docs.`);
              return docs.map((doc) => doc.pageContent).join("\n\n");
            } catch (e: any) {
              console.error("[YouTube] Error:", e);
              return `Error processing YouTube video: ${e.message}`;
            }
          },
        })
      );
    }

    if (toolNames.includes("wolfram_tool")) {
      if (searchPreferences.wolframAppId) {
        const wolframTool = new WolframAlphaTool({
          appid: searchPreferences.wolframAppId,
        });
        wolframTool.description =
          "A wrapper around Wolfram Alpha. Useful for when you need to answer questions about Math, Science, Technology, Culture, Society and Everyday Life. Input should be a search query. Use this tool to get current time and weather.";
        tools.push(wolframTool);
      }
    }

    if (toolNames.includes("memory")) {
      tools.push(
        new DynamicStructuredTool({
          name: "memory",
          description:
            "A tool that allows the agent to store things that the user has asked them to remember or consider important. Use this tool precisely to store relevant and important information about the user when they request it or when you identify key context that should persist for future interactions.",
          schema: z.object({
            memory: z
              .string()
              .describe(
                "key information about the user, any user preference to personalize future interactions. It must be short and concise"
              ),
            question: z.string().describe("question user asked"),
          }),
          func: async ({ memory, question }) => {
            console.log("[Memory] Tool called with:", { memory, question });
            return "Memory has been noted and saved for future reference.";
          },
        })
      );
    }

    // Create the appropriate model instance
    let modelInstance: any;
    console.log("Initializing model:", { baseModel, model, hasApiKey: !!apiKey, apiKeyLength: apiKey?.length });

    switch (baseModel) {
      case "openai":
        modelInstance = new ChatOpenAI({
          model: model,
          apiKey: apiKey,
          streaming: true,
        });
        break;
      case "anthropic":
        modelInstance = new ChatAnthropic({
          model: model,
          apiKey: apiKey,
          streaming: true,
        });
        break;
      case "gemini":
        modelInstance = new ChatGoogleGenerativeAI({
          model: model,
          apiKey: apiKey,
          streaming: true,
          maxRetries: 2,
        });
        break;
      case "ollama":
        modelInstance = new ChatOllama({
          model: model,
          streaming: true,
        });
        break;
      default:
        throw new Error(`Unsupported model: ${baseModel}`);
    }

    if (tools.length > 0) {
      // Create agent with tools
      const agent = createAgent({
        model: modelInstance,
        tools: tools,
        systemPrompt: systemPrompt || "You are a helpful AI assistant with access to various tools. You can use these tools at your disposal whenever needed to provide accurate and helpful responses. When you need external information, current data, or need to search through documents, don't hesitate to use the available tools. Always strive to give comprehensive and well-researched answers.",
      });

      // Convert message history
      const messageHistory = messages.map((msg: any) => {
        if (msg.role === "user" || msg.type === "human") {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      // Stream the response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const result = await agent.stream(
              { messages: messageHistory },
              { streamMode: "values" }
            );

            for await (const chunk of result) {
              try {
                // console.log("Chunk received:", JSON.stringify(chunk, null, 2));
                const latestMessage = chunk.messages?.at(-1);
                const isAIMessage = latestMessage?.constructor?.name === "AIMessage" || latestMessage?._getType?.() === "ai";
                
                if (isAIMessage) {
                  const encoder = new TextEncoder();

                  // Handle tool calls
                  if ((latestMessage as any)?.tool_calls?.length > 0) {
                    controller.enqueue(
                      encoder.encode(
                        JSON.stringify({
                          type: "tool_calls",
                          tool_calls: (latestMessage as any).tool_calls,
                        }) + "\n"
                      )
                    );
                  }

                  // Handle content (only if string)
                  if (typeof latestMessage?.content === "string" && latestMessage.content.length > 0) {
                    controller.enqueue(
                      encoder.encode(
                        JSON.stringify({
                          type: "content",
                          content: latestMessage.content,
                        }) + "\n"
                      )
                    );
                  }
                }
              } catch (chunkError) {
                console.error("Error processing chunk:", chunkError);
              }
            }
            controller.close();
          } catch (error: any) {
            console.error("Stream error:", error);
            try {
              const encoder = new TextEncoder();
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: "error",
                    error: error.message,
                    details: JSON.stringify(error, Object.getOwnPropertyNames(error)),
                  }) + "\n"
                )
              );
            } catch (e) {
              console.error("Failed to send error to stream:", e);
            }
            try {
              controller.error(error);
            } catch (e) {
              console.error("Failed to close stream with error:", e);
            }
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Simple model call without tools
      const messageHistory = messages.map((msg: any) => {
        if (msg.role === "user" || msg.type === "human") {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      const stream = await modelInstance.stream(messageHistory);

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const encoder = new TextEncoder();
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: "content",
                    content: chunk.content,
                  }) + "\n"
                )
              );
            }
            controller.close();
          } catch (error: any) {
            console.error("Stream error:", error);
            const encoder = new TextEncoder();
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "error",
                  error: error.message,
                  details: JSON.stringify(error, Object.getOwnPropertyNames(error)),
                }) + "\n"
              )
            );
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error", 
        details: JSON.stringify(error, Object.getOwnPropertyNames(error)) 
      },
      { status: 500 }
    );
  }
}
