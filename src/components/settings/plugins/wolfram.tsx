import { useToast } from "@/components/ui/use-toast";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePreferenceContext } from "@/context/preferences";
import { ArrowRight, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export const WolframPlugin = () => {
  const { toast } = useToast();
  const { preferences, updatePreferences } = usePreferenceContext();
  const [appId, setAppId] = useState("");

  useEffect(() => {
    setAppId(preferences.wolframAppId || "");
  }, [preferences.wolframAppId]);

  const handleSaveAppId = () => {
    if (!appId) return;
    updatePreferences({ wolframAppId: appId });
    toast({
      title: "Success",
      description: "Wolfram App ID saved",
      variant: "default",
    });
  };

  const handleRemoveAppId = () => {
    setAppId("");
    updatePreferences({ wolframAppId: "" });
    toast({
      title: "Removed",
      description: "Wolfram App ID removed",
      variant: "default",
    });
  };

  return (
    <Flex direction="col" gap="sm">
      <div className="flex flex-row items-end justify-between">
        <p className="text-xs md:text-sm text-zinc-500">
          Wolfram Alpha App ID
        </p>
      </div>
      <Input
        placeholder="Enter your Wolfram Alpha App ID"
        value={appId}
        onChange={(e) => setAppId(e.target.value)}
        type="password"
        disabled={!!preferences.wolframAppId}
        className="w-full"
      />
      <div className="flex flex-row items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="w-fit"
          onClick={() => {
            window.open(
              "https://developer.wolframalpha.com/portal/myapps/",
              "_blank"
            );
          }}
        >
          Get your API key here <ArrowRight size={16} weight="bold" className="ml-2" />
        </Button>
        {appId && appId !== preferences.wolframAppId && (
          <Button onClick={handleSaveAppId} size="sm">
            Save API Key
          </Button>
        )}
        {preferences.wolframAppId && (
          <Button
            variant="outline"
            onClick={handleRemoveAppId}
            size="sm"
          >
            Remove API Key
          </Button>
        )}
      </div>
      <p className="text-xs text-zinc-400 flex flex-row items-center gap-1">
        <Info size={12} weight="bold" />
        Your API Key is stored locally on your browser and never sent anywhere else.
      </p>
    </Flex>
  );
};
