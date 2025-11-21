import { NextRequest, NextResponse } from "next/server";
import { createAgent } from "langchain";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
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
            description: "Use this to look up factual information, current events, definitions, scientific concepts, historical data, or anything requiring verification from the internet. This is your primary tool for retrieving up-to-date information and confirming details beyond your internal knowledge.",
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
          description: "Use this tool whenever the user provides a link that is not a YouTube URL. The tool fetches the full content of the webpage, allowing you to read, extract, and summarize all relevant information directly from the site. Use the retrieved content to answer questions, verify details, give explanations, or provide insights based on what the webpage contains.",
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
            "Use this tool whenever the user has uploaded a document and asks questions related to that document. This tool allows you to extract information directly from the uploaded file, read specific sections, summarize content, pull out key details, and answer user questions accurately based on the document. It also supports deeper reasoning, comparisons, and interpretation of the material, making it essential for any doc-based query.",
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
          description: "Use this tool whenever the user provides a YouTube link or any variation of a YouTube video URL. The tool retrieves the full transcription of the video, which you can then use to answer questions, summarize content, extract key points, analyze specific segments, or provide detailed insights about the video. This tool is specifically for understanding and working with video content via its transcript.",
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
          "Use this for any query requiring precise, computation-backed results. This includes mathematics, physics, chemistry, engineering, statistics, conversions, and structured scientific facts. You should also use Wolfram for exact factual queries such as the current time in a specific location, weather conditions, geographic details, astronomy information, or any scenario where accuracy is essential. Wolfram can generate mathematical and scientific plots and visualizations—request these when useful, and it will return image links that can be displayed directly in your response.";
        tools.push(wolframTool);
      }
    }

    if (toolNames.includes("memory")) {
      tools.push(
        new DynamicStructuredTool({
          name: "memory",
          description:
            "Use this to store important user-specific information that will matter in future conversations. Only store meaningful preferences or details the user explicitly wants remembered. Recall stored memory only when it genuinely benefits the user without being intrusive.",
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

      if (systemPrompt) {
        messageHistory.unshift(new SystemMessage(systemPrompt));
      }

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
