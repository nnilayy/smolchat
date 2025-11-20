import { FC, ReactNode, RefAttributes } from "react";
import { Browser, Globe, YoutubeLogo, Function } from "@phosphor-icons/react";
import { TApiKeys, TPreferences, usePreferences } from "./use-preferences";
import { usePreferenceContext } from "@/context/preferences";
import { googleSearchTool } from "@/tools/google";
import { tavilySearchTool } from "@/tools/tavily";
import { useSettingsContext } from "@/context";
import { useToast } from "@/components/ui/use-toast";
import {
  GlobalSearchIcon,
  HugeiconsProps,
  BrainIcon,
  File02Icon,
} from "hugeicons-react";
import { TToolResponse } from ".";
import { memoryTool } from "@/tools/memory";
import { retrievalTool } from "@/tools/retrieval";
import { youtubeTool } from "@/tools/youtube";
import { wolframTool } from "@/tools/wolfram";
import { webReaderTool } from "@/tools/web-scraper";

const YoutubeIconAdapter: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>> = ({ ...props }) => {
  return <YoutubeLogo weight="regular" {...(props as any)} />;
};

const WolframIconAdapter: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>> = ({ ...props }) => {
  return <Function weight="regular" {...(props as any)} />;
};

const WebReaderIconAdapter: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>> = ({ ...props }) => {
  return <Globe weight="regular" {...(props as any)} />;
};

export const toolKeys = ["web_search", "retrieval_tool", "youtube_tool", "wolfram_tool", "memory", "web_reader_tool"];
export type TToolKey = (typeof toolKeys)[number];
export type IconSize = "sm" | "md" | "lg";

export type TToolArg = {
  updatePreferences: ReturnType<
    typeof usePreferenceContext
  >["updatePreferences"];
  preferences: TPreferences;
  apiKeys: TApiKeys;
  sendToolResponse: (response: TToolResponse) => void;
};

export type TTool = {
  key: TToolKey;
  description: string;
  renderUI?: (args: any) => ReactNode;
  name: string;
  loadingMessage?: string;
  resultMessage?: string;
  tool: (args: TToolArg) => any;
  icon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
  smallIcon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
  validate?: () => Promise<boolean>;
  validationFailedAction?: () => void;
  showInMenu?: boolean;
};

export const useTools = () => {
  const { preferences, updatePreferences, apiKeys } = usePreferenceContext();
  const { open } = useSettingsContext();
  const { toast } = useToast();
  const tools: TTool[] = [
    {
      key: "web_search",
      description: "Search for information on the web",
      tool:
        preferences?.defaultWebSearchEngine === "google"
          ? googleSearchTool
          : tavilySearchTool,
      name: "General Web Search",
      showInMenu: true,
      loadingMessage:
        preferences?.defaultWebSearchEngine === "google"
          ? "Searching on Google..."
          : "Searching on Tavily...",
      resultMessage:
        preferences?.defaultWebSearchEngine === "google"
          ? "Results from Google Search"
          : "Results from Tavily Search",
      icon: GlobalSearchIcon,
      smallIcon: GlobalSearchIcon,
      validate: async () => {
        if (preferences?.defaultWebSearchEngine === "google") {
          if (
            !preferences?.googleSearchApiKey ||
            !preferences?.googleSearchEngineId
          ) {
            return false;
          }
        }
        if (preferences?.defaultWebSearchEngine === "tavily") {
          if (!preferences?.tavilyApiKey) {
            return false;
          }
        }
        return true;
      },
      validationFailedAction: () => {
        toast({
          title: "Web Search API Key Missing",
          description: "To use Web Search tool, set an API key",
          variant: "destructive",
        });
        open("plugins", "websearch");
      },
    },
    {
      key: "web_reader_tool",
      description: "Read and extract content from web pages",
      tool: webReaderTool,
      name: "Web Pages Search",
      showInMenu: true,
      loadingMessage: "Reading web pages...",
      resultMessage: "Content extracted from web pages",
      icon: WebReaderIconAdapter,
      smallIcon: WebReaderIconAdapter,
    },
    {
      key: "retrieval_tool",
      description: "Search for information from uploaded docs",
      tool: retrievalTool,
      name: "Retrieval Augmented Generation",
      showInMenu: true,
      loadingMessage: "Searching in documents...",
      resultMessage: "Results from documents",
      icon: File02Icon,
      smallIcon: File02Icon,
      validate: async () => {
        if (!preferences.ragSettings?.apiKey) {
          return false;
        }
        return true;
      },
      validationFailedAction: () => {
        toast({
          title: "Embedding Model API Key Missing",
          description:
            "To use RAG tool, set an API key for the embedding model",
          variant: "destructive",
        });
        open("rag", "embedding");
      },
    },
    {
      key: "youtube_tool",
      description: "Extract info from YouTube videos",
      tool: youtubeTool,
      name: "YouTube Search",
      showInMenu: true,
      loadingMessage: "Analyzing YouTube video...",
      resultMessage: "Video information extracted",
      icon: YoutubeIconAdapter,
      smallIcon: YoutubeIconAdapter,
      validate: async () => {
        return true;
      },
      validationFailedAction: () => {},
    },
    {
      key: "wolfram_tool",
      description: "Use Wolfram Alpha knowledge engine to get precise answers across any domain when needed",
      tool: wolframTool,
      name: "Wolfram Alpha",
      showInMenu: true,
      loadingMessage: "Getting Info using Wolfram Alpha...",
      resultMessage: "Wolfram Alpha result",
      icon: WolframIconAdapter,
      smallIcon: WolframIconAdapter,
      validate: async () => {
        if (!preferences.wolframAppId) {
          return false;
        }
        return true;
      },
      validationFailedAction: () => {
        toast({
          title: "Wolfram Alpha API Key Missing",
          description: "To use Wolfram Alpha tool, set an API key",
          variant: "destructive",
        });
        open("plugins", "wolfram");
      },
    },
    {
      key: "memory",
      description: "AI will remeber things about you",
      tool: memoryTool,
      name: "Memory",
      showInMenu: true,
      validate: async () => {
        return true;
      },
      validationFailedAction: () => {
        open("web-search");
      },
      renderUI: ({ image }) => {
        return (
          <img
            src={image}
            alt=""
            className="w-[400px] h-[400px] rounded-2xl border"
          />
        );
      },
      loadingMessage: "Saving to the memory...",
      resultMessage: "Updated memory",
      icon: BrainIcon,
      smallIcon: BrainIcon,
    },
  ];

  const getToolByKey = (key: TToolKey) => {
    return tools.find((tool) => tool.key.includes(key));
  };

  const getToolInfoByKey = (key: TToolKey) => {
    return tools.find((tool) => tool.key.includes(key));
  };

  return {
    tools,
    getToolByKey,
    getToolInfoByKey,
  };
};
