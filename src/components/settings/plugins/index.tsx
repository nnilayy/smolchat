import { usePreferenceContext, useSettingsContext } from "@/context";
import { WebSearchPlugin } from "./web-search";
import { WolframPlugin } from "./wolfram";
import { Flex } from "@/components/ui/flex";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ModelIcon, ModelIconType } from "@/components/model-icon";
import { CheckmarkCircle02Icon, AlertCircleIcon } from "hugeicons-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const PluginSettings = () => {
  const { preferences } = usePreferenceContext();
  const { selectedSubMenu } = useSettingsContext();
  const [value, setValue] = useState(selectedSubMenu || "websearch");

  useEffect(() => {
    if (selectedSubMenu) {
      setValue(selectedSubMenu);
    }
  }, [selectedSubMenu]);

  const pluginSettingsData = [
    {
      value: "websearch",
      label: "Web Search",
      iconType: "websearch",
      settingsComponent: WebSearchPlugin,
      connected:
        preferences.defaultWebSearchEngine === "tavily"
          ? !!preferences.tavilyApiKey
          : !!preferences.googleSearchApiKey &&
            !!preferences.googleSearchEngineId,
    },
    {
      value: "wolfram",
      label: "Wolfram Alpha",
      iconType: "custom",
      settingsComponent: WolframPlugin,
      connected: !!preferences.wolframAppId,
    },
  ];

  return (
    <Flex direction={"col"} gap="lg" className="p-2">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={value}
        onValueChange={setValue}
      >
        {pluginSettingsData?.map((plugin) => (
          <AccordionItem key={plugin.value} value={plugin.value}>
            <AccordionTrigger>
              <Flex gap={"sm"} items="center">
                <ModelIcon type={plugin.iconType as ModelIconType} size="sm" />
                {plugin.label}
              </Flex>
              <Flex className="flex-1" />
              <div
                className={cn(
                  "px-2 !rotate-0",
                  plugin.connected ? "text-emerald-600" : "text-zinc-500"
                )}
              >
                {plugin.connected ? (
                  <CheckmarkCircle02Icon size={20} strokeWidth={1.5} />
                ) : (
                  <AlertCircleIcon size={20} strokeWidth={1.5} />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <plugin.settingsComponent />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Flex>
  );
};
