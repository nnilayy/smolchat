import { usePreferenceContext } from "@/context/preferences";
import { TPreferences, defaultPreferences } from "@/hooks/use-preferences";
import { ArrowClockwise, Info, PencilSimple, Check } from "@phosphor-icons/react";
import { ChangeEvent, useState } from "react";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Type } from "../ui/text";
import { Textarea } from "../ui/textarea";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";
import { useTheme } from "next-themes";
import { Moon02Icon, Sun01Icon } from "hugeicons-react";

export const CommonSettings = () => {
  const { preferences, updatePreferences } = usePreferenceContext();
  const { theme, setTheme } = useTheme();
  const [isEditingSystemPrompt, setIsEditingSystemPrompt] = useState(false);

  const renderResetToDefault = (key: keyof TPreferences) => {
    return (
      <Button
        variant="outline"
        size="iconXS"
        rounded="lg"
        onClick={() => {
          updatePreferences({ [key]: defaultPreferences[key] });
        }}
      >
        <ArrowClockwise size={14} weight="bold" />
      </Button>
    );
  };

  const onInputChange = (min: number, max: number, key: keyof TPreferences) => {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      if (value < min) {
        updatePreferences({ [key]: min });
        return;
      } else if (value > max) {
        updatePreferences({ [key]: max });
        return;
      }
      updatePreferences({ [key]: value });
    };
  };

  const onSliderChange = (
    min: number,
    max: number,
    key: keyof TPreferences
  ) => {
    return (value: number[]) => {
      if (value?.[0] < min) {
        updatePreferences({ [key]: min });
        return;
      } else if (value?.[0] > max) {
        updatePreferences({ [key]: max });
        return;
      }
      updatePreferences({ [key]: value?.[0] });
    };
  };

  return (
    <div className="flex flex-col gap-2 w-full pb-10">
      <SettingsContainer title="Theme & Model Settings">
        <Flex direction="col" gap="sm" className="w-full" items="start">
          <Type
            size="xs"
            textColor="secondary"
            className="flex flex-row items-center gap-1"
          >
            Choose Default Theme for smolchat
          </Type>
          <SettingCard className="p-1 w-full">
            <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border dark:border-white/5">
              <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="sm"
                className={theme === "light" ? "shadow-sm" : "text-zinc-500"}
                onClick={() => setTheme("light")}
              >
                <Sun01Icon size={16} /> Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="sm"
                className={theme === "dark" ? "shadow-sm" : "text-zinc-500"}
                onClick={() => setTheme("dark")}
              >
                <Moon02Icon size={16} /> Dark
              </Button>
            </div>
          </SettingCard>
        </Flex>

        <Flex direction="col" gap="xs" className="w-full" items="start">
          <Type
            size="xs"
            textColor="secondary"
            className="flex flex-row items-center gap-1"
          >
            System Default Prompt <Info weight="regular" size={14} />
          </Type>

          <Textarea
            name="systemPrompt"
            value={preferences.systemPrompt}
            autoComplete="off"
            disabled={!isEditingSystemPrompt}
            onChange={(e) => {
              updatePreferences({ systemPrompt: e.target.value });
            }}
          />
          <Flex gap="sm" className="w-full pt-1">
            <Button
              variant={isEditingSystemPrompt ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditingSystemPrompt(!isEditingSystemPrompt)}
              className="gap-2"
            >
              {isEditingSystemPrompt ? (
                <Check size={14} weight="bold" />
              ) : (
                <PencilSimple size={14} weight="bold" />
              )}
              {isEditingSystemPrompt ? "Save" : "Edit"}
            </Button>
            {preferences.systemPrompt !== defaultPreferences.systemPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  updatePreferences({
                    systemPrompt: defaultPreferences.systemPrompt,
                  });
                }}
              >
                Reset System Prompt
              </Button>
            )}
          </Flex>
        </Flex>

      <SettingCard className="p-3 mt-1">
        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">Context Length</Type>
            <Type size="xxs" textColor="secondary">
              Number of previous messages to use as context
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Input
              name="messageLimit"
              type="number"
              size="sm"
              className="w-[100px]"
              value={preferences?.messageLimit}
              autoComplete="off"
              onChange={(e) => {
                updatePreferences({
                  messageLimit: Number(e.target.value),
                });
              }}
            />
            {renderResetToDefault("messageLimit")}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />

        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">Max output tokens</Type>
            <Type size="xxs" textColor="secondary">
              Maximum number of tokens to generate
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Input
              name="maxTokens"
              type="number"
              size="sm"
              className="w-[100px]"
              value={preferences?.maxTokens}
              autoComplete="off"
              onChange={(e) => {
                updatePreferences({
                  maxTokens: Number(e.target.value),
                });
              }}
            />
            {renderResetToDefault("maxTokens")}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />

        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">Temperature</Type>
            <Type size="xxs" textColor="secondary">
              Maximum number of tokens to generate
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Slider
              className="my-2 w-[80px]"
              value={[Number(preferences?.temperature)]}
              min={0}
              step={0.1}
              max={1}
              onValueChange={onSliderChange(0, 1, "temperature")}
            />
            <Input
              name="temperature"
              type="number"
              size="sm"
              className="w-[80px]"
              value={preferences?.temperature}
              min={0}
              step={1}
              max={100}
              autoComplete="off"
              onChange={onInputChange(0, 1, "temperature")}
            />
            {renderResetToDefault("temperature")}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />

        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">TopP</Type>
            <Type size="xxs" textColor="secondary">
              Maximum number of tokens to generate
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Slider
              className="my-2 w-[80px]"
              value={[Number(preferences.topP)]}
              min={0}
              step={0.01}
              max={1}
              onValueChange={onSliderChange(0, 1, "topP")}
            />
            <Input
              name="topP"
              type="number"
              size="sm"
              className="w-[80px]"
              value={preferences.topP}
              min={0}
              step={1}
              max={1}
              autoComplete="off"
              onChange={onInputChange(0, 1, "topP")}
            />
            {renderResetToDefault("topP")}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />

        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">TopK</Type>
            <Type size="xxs" textColor="secondary">
              Maximum number of tokens to generate
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Slider
              className="my-2 w-[80px]"
              value={[Number(preferences.topK)]}
              min={1}
              step={1}
              max={100}
              onValueChange={onSliderChange(1, 100, "topK")}
            />
            <Input
              name="topK"
              type="number"
              size="sm"
              className="w-[80px]"
              value={preferences.topK}
              min={0}
              step={1}
              max={100}
              autoComplete="off"
              onChange={onInputChange(1, 100, "topK")}
            />
            {renderResetToDefault("topK")}
          </Flex>
        </Flex>
      </SettingCard>
    </SettingsContainer>
    </div>
  );
};
