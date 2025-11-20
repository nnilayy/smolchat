import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { ArrowRight, CaretDown, Info } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePreferenceContext } from "@/context/preferences";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";

export const WebSearchPlugin = () => {
  const { toast } = useToast();
  const { preferences, updatePreferences } = usePreferenceContext();

  const [googleEngineId, setGoogleEngineId] = useState("");
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [tavilyKey, setTavilyKey] = useState("");

  useEffect(() => {
    setGoogleEngineId(preferences.googleSearchEngineId || "");
    setGoogleApiKey(preferences.googleSearchApiKey || "");
    setTavilyKey(preferences.tavilyApiKey || "");
  }, [
    preferences.googleSearchEngineId,
    preferences.googleSearchApiKey,
    preferences.tavilyApiKey,
  ]);

  const handleRunGoogleTest = async () => {
    try {
      const url = "https://www.googleapis.com/customsearch/v1";
      const params = {
        key: googleApiKey,
        cx: googleEngineId,
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

  const handleSaveGoogle = () => {
    updatePreferences({
      googleSearchEngineId: googleEngineId,
      googleSearchApiKey: googleApiKey,
    });
    toast({
      title: "Success",
      description: "Google Search settings saved",
      variant: "default",
    });
  };

  const handleRemoveGoogle = () => {
    setGoogleEngineId("");
    setGoogleApiKey("");
    updatePreferences({
      googleSearchEngineId: "",
      googleSearchApiKey: "",
    });
    toast({
      title: "Removed",
      description: "Google Search settings removed",
      variant: "default",
    });
  };

  const handleSaveTavilyKey = async () => {
    if (!tavilyKey) return;

    try {
      const response = await axios.post("https://api.tavily.com/search", {
        api_key: tavilyKey,
        query: "test",
        search_depth: "basic",
        max_results: 1,
      });

      if (response.status === 200) {
        updatePreferences({ tavilyApiKey: tavilyKey });
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
    setTavilyKey("");
    updatePreferences({ tavilyApiKey: "" });
    toast({
      title: "Removed",
      description: "Tavily API key removed",
      variant: "default",
    });
  };

  const hasGoogleChanges =
    (googleEngineId && googleEngineId !== preferences.googleSearchEngineId) ||
    (googleApiKey && googleApiKey !== preferences.googleSearchApiKey);

  const hasGoogleSaved =
    preferences.googleSearchEngineId || preferences.googleSearchApiKey;

  return (
    <Flex
      direction={"col"}
      gap={"sm"}
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
        <div className="flex flex-col w-full gap-2 pt-1">
          <div className="flex flex-row items-end justify-between">
            <p className="text-xs md:text-sm text-zinc-500">
              Google Search Engine ID
            </p>
          </div>
          <Input
            name="googleSearchEngineId"
            type="text"
            value={googleEngineId}
            autoCapitalize="off"
            disabled={!!preferences.googleSearchEngineId}
            onChange={(e) => setGoogleEngineId(e.target.value)}
          />
          <div className="flex flex-row items-end justify-between pt-2">
            <p className="text-xs md:text-sm text-zinc-500">
              Google Search Api Key
            </p>
          </div>
          <Input
            name="googleSearchApiKey"
            type="text"
            value={googleApiKey}
            autoCapitalize="off"
            disabled={!!preferences.googleSearchApiKey}
            onChange={(e) => setGoogleApiKey(e.target.value)}
          />
          <div className="flex flex-row items-center gap-2 pt-2">
            <Button onClick={handleRunGoogleTest} size={"sm"}>
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
            {hasGoogleChanges && (
              <Button onClick={handleSaveGoogle} size={"sm"}>
                Save API Key
              </Button>
            )}
            {hasGoogleSaved && (
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={handleRemoveGoogle}
              >
                Remove API Key
              </Button>
            )}
          </div>
          <p className="text-xs text-zinc-400 flex flex-row items-center gap-1">
            <Info size={12} weight="bold" />
            Your API Key is stored locally on your browser and never sent anywhere else.
          </p>
        </div>
      )}
      {preferences.defaultWebSearchEngine === "tavily" && (
        <div className="flex flex-col w-full gap-2 pt-1">
          <div className="flex flex-row items-end justify-between">
            <p className="text-xs md:text-sm text-zinc-500">Tavily API Key</p>
          </div>
          <Input
            name="tavilyApiKey"
            type="password"
            value={tavilyKey}
            autoCapitalize="off"
            placeholder="tvly-..."
            disabled={!!preferences.tavilyApiKey}
            onChange={(e) => setTavilyKey(e.target.value)}
          />
          <div className="flex flex-row items-center gap-2">
            <Button
              size={"sm"}
              variant={"secondary"}
              onClick={() => {
                window.open("https://app.tavily.com/home", "_blank");
              }}
            >
              Get your API key here <ArrowRight size={16} weight="bold" className="ml-2" />
            </Button>
            {tavilyKey && tavilyKey !== preferences.tavilyApiKey && (
              <Button
                size={"sm"}
                onClick={handleSaveTavilyKey}
              >
                Save API Key
              </Button>
            )}
            {preferences.tavilyApiKey && (
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={handleRemoveTavilyKey}
              >
                Remove API Key
              </Button>
            )}
          </div>
          <p className="text-xs text-zinc-400 flex flex-row items-center gap-1">
            <Info size={12} weight="bold" />
            Your API Key is stored locally on your browser and never sent anywhere else.
          </p>
        </div>
      )}
    </Flex>
  );
};
