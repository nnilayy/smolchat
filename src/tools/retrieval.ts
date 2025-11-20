import { TToolArg } from "@/hooks";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const retrievalTool = (args: TToolArg) => {
  return new DynamicStructuredTool({
    name: "retrieval_tool",
    description: "Search for information in the uploaded documents.",
    schema: z.object({
      input: z.string(),
    }),
    func: async ({ input }) => {
      return "This tool is executed on the server side.";
    },
  });
};
