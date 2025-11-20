import { ArrowRight, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useLLMTest } from "@/hooks/use-llm-test";
import { usePreferenceContext } from "@/context/preferences";
import { Flex } from "@/components/ui/flex";

export const AnthropicSettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferenceContext();
  const { renderSaveApiKeyButton } = useLLMTest();
  useEffect(() => {
    setKey(apiKeys.anthropic || "");
  }, [apiKeys.anthropic]);
  return (
    <Flex direction={"col"} gap="sm">
      <div className="flex flex-row items-end justify-between">
        <p className="text-xs md:text-sm  text-zinc-500">Anthropic API Key</p>
      </div>
      <Input
        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        value={key}
        type="password"
        autoComplete="off"
        disabled={!!apiKeys.anthropic}
        onChange={(e) => {
          setKey(e.target.value);
        }}
      />
      <div className="flex flex-row items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            window.open(
              "https://console.anthropic.com/settings/keys",
              "_blank"
            );
          }}
        >
          Get your API key here <ArrowRight size={16} weight="bold" />
        </Button>
        {key &&
          key !== apiKeys?.anthropic &&
          renderSaveApiKeyButton("anthropic", key.trim(), () => {
            updateApiKey("anthropic", key.trim());
          })}
        {apiKeys?.anthropic && (
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              setKey("");
              updateApiKey("anthropic", "");
            }}
          >
            Remove API Key
          </Button>
        )}
      </div>

      <div className="flex flex-row items-center gap-1 py-2 text-zinc-500">
        <Info size={16} weight="bold" />
        <p className="text-xs">
          Your API Key is stored locally on your browser and never sent anywhere
          else.
        </p>
      </div>
    </Flex>
  );
};
