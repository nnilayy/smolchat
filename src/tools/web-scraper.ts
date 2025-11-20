import { TToolArg } from "@/hooks";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const webReaderTool = (args: TToolArg) => {
  return new DynamicStructuredTool({
    name: "web_reader_tool",
    description: "Read and extract content from specific web pages. Use this tool when the user provides one or more URLs and asks to read, summarize, or extract information from them.",
    schema: z.object({
      urls: z.array(z.string()).describe("The list of URLs to read."),
    }),
    func: async ({ urls }) => {
      return "This tool is executed on the server side.";
    },
  });
};
