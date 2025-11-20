import { TToolArg } from "@/hooks";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const wolframTool = (args: TToolArg) => {
  return new DynamicStructuredTool({
    name: "wolfram_tool",
    description: "Access WolframAlpha for computation and knowledge.",
    schema: z.object({
      input: z.string(),
    }),
    func: async ({ input }) => {
      return "This tool is executed on the server side.";
    },
  });
};
