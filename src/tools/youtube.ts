import { TToolArg } from "@/hooks";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const youtubeTool = (args: TToolArg) => {
  return new DynamicStructuredTool({
    name: "youtube_tool",
    description: "Extracts transcripts and video information from YouTube videos.",
    schema: z.object({
      input: z.string(),
    }),
    func: async ({ input }) => {
      return "This tool is executed on the server side.";
    },
  });
};
