import { TToolArg } from "@/hooks";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";

const tavilySearchTool = (args: TToolArg) => {
  const { sendToolResponse } = args;
  const webSearchSchema = z.object({
    input: z.string(),
  });

  return new DynamicStructuredTool({
    name: "web_search",
    description:
      "A web search tool that provides access to real-time information and fact verification. Use this tool whenever you feel unconfident about an answer, need to verify facts, or require external information to provide a complete response. If you think a search might help confirm details or provide better context, do not hesitate to use this tool. Input should be a search query.",
    schema: webSearchSchema,
    func: async ({ input }, runManager) => {
      try {
        const tavilySearch = new TavilySearch({
          maxResults: 30,
          searchDepth: "advanced",
          includeImages: true,
          tavilyApiKey: args.preferences.tavilyApiKey || process.env.TAVILY_API_KEY,
        });

        const results = await tavilySearch.invoke({ query: input });

        sendToolResponse({
          toolName: "web_search",
          toolResponse: results,
          toolLoading: false,
        });

        return results;
      } catch (error) {
        runManager?.handleToolError(`Error performing Tavily search: ${error}`);
        sendToolResponse({
          toolName: "web_search",
          toolResponse: "Error performing search",
          toolLoading: false,
        });
        return "Error performing search";
      }
    },
  });
};

export { tavilySearchTool };
