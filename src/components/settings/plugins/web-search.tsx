import { useToast } from "@/components/ui/use-toast";

import axios from "axios";
import { SettingsContainer } from "../settings-container";
import { ArrowRight, CaretDown, Info } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePreferenceContext } from "@/context/preferences";
import { useEffect, useState } from "react";
import { TPreferences } from "@/hooks/use-preferences";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingCard } from "../setting-card";
import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";

export const WebSearchPlugin = () => {
  const { toast } = useToast();
  const { preferences, updatePreferences } = usePreferenceContext();

  useEffect(() => {}, []);

  const handleRunTest = async () => {
    try {
      const url = "https://www.googleapis.com/customsearch/v1";
      const params = {
        key: preferences.googleSearchApiKey,
        cx: preferences.googleSearchEngineId,
        q: "Latest news",
      };

      const response = await axios.get(url, { params });

      if (response.status === 200) {
        toast({
          title: "Test Successful",
          description: "Google search plugin is working",
          variant: "default",
        });
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Google search plugin is not working",
        variant: "destructive",
      });
    }
  };

  const handleSaveTavilyKey = async () => {
    if (!preferences.tavilyApiKey) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post("https://api.tavily.com/search", {
        api_key: preferences.tavilyApiKey,
        query: "test",
        search_depth: "basic",
        max_results: 1,
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Tavily API key verified and saved",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid Tavily API key",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTavilyKey = () => {
    updatePreferences({ tavilyApiKey: "" });
    toast({
      title: "Removed",
      description: "Tavily API key removed",
      variant: "default",
    });
  };

  return (
    <Flex
      direction={"col"}
      gap={"sm"}
      className="border-t pt-2 border-white/10"
    >
      <Flex className="w-full" justify={"between"} items="center">
        <Type size={"sm"} textColor={"secondary"}>
          Default Search Engine
        </Type>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"sm"} variant={"secondary"}>
              {preferences.defaultWebSearchEngine}{" "}
              <CaretDown size={12} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]" align="end">
            <DropdownMenuItem
              onClick={() => {
                updatePreferences({
                  defaultWebSearchEngine: "tavily",
                });
              }}
            >
              Tavily
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                updatePreferences({
                  defaultWebSearchEngine: "google",
                });
              }}
            >
              Google
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Flex>
      {preferences.defaultWebSearchEngine === "google" && (
        <SettingCard className="flex flex-col w-full items-start gap-2 py-3">
          <Flex direction={"col"} gap="sm" className="w-full">
            <Type
              size={"xs"}
              className="flex flex-row gap-2 items-center"
              textColor={"secondary"}
            >
              Google Search Engine ID <Info weight="regular" size={14} />
            </Type>
            <Input
              name="googleSearchEngineId"
              type="text"
              value={preferences.googleSearchEngineId}
              autoCapitalize="off"
              onChange={(e) => {
                updatePreferences({
                  googleSearchEngineId: e.target.value,
                });
              }}
            />
          </Flex>
          <Flex direction={"col"} gap={"sm"} className="w-full">
            <Type
              size={"xs"}
              className="flex flex-row gap-2 items-center"
              textColor={"secondary"}
            >
              Google Search Api Key <Info weight="regular" size={14} />
            </Type>
            <Input
              name="googleSearchApiKey"
              type="text"
              value={preferences.googleSearchApiKey}
              autoCapitalize="off"
              onChange={(e) => {
                updatePreferences({
                  googleSearchApiKey: e.target.value,
                });
              }}
            />
          </Flex>
          <Flex gap="sm">
            <Button onClick={handleRunTest} size={"sm"}>
              Run check
            </Button>
            <Button
              size={"sm"}
              variant={"secondary"}
              onClick={() => {
                window.open(
                  "https://programmablesearchengine.google.com/controlpanel/create",
                  "_blank"
                );
              }}
            >
              Get your API key here <ArrowRight size={16} weight="bold" />
            </Button>
          </Flex>
        </SettingCard>
      )}
      {preferences.defaultWebSearchEngine === "tavily" && (
        <SettingCard className="flex flex-col w-full items-start gap-2 py-3">
          <Flex direction={"col"} gap="sm" className="w-full">
            <Type
              size={"xs"}
              className="flex flex-row gap-2 items-center"
              textColor={"secondary"}
            >
              Tavily API Key <Info weight="regular" size={14} />
            </Type>
            <Input
              name="tavilyApiKey"
              type="password"
              value={preferences.tavilyApiKey || ""}
              autoCapitalize="off"
              placeholder="tvly-..."
              onChange={(e) => {
                updatePreferences({
                  tavilyApiKey: e.target.value,
                });
              }}
            />
          </Flex>
          <Flex gap="sm" className="w-full justify-between items-center">
            <Flex gap="sm">
              <Button
                size={"sm"}
                onClick={handleSaveTavilyKey}
                disabled={!preferences.tavilyApiKey}
              >
                Save
              </Button>
              {preferences.tavilyApiKey && (
                <Button
                  size={"sm"}
                  variant={"destructive"}
                  onClick={handleRemoveTavilyKey}
                >
                  Remove
                </Button>
              )}
            </Flex>
            <Button
              size={"sm"}
              variant={"secondary"}
              onClick={() => {
                window.open("https://tavily.com/", "_blank");
              }}
            >
              Get Key <ArrowRight size={16} weight="bold" className="ml-2" />
            </Button>
          </Flex>
        </SettingCard>
      )}
    </Flex>
  );
};
