import { usePreferenceContext } from "@/context/preferences";
import { useModelList } from "@/hooks/use-model-list";
import { TToolKey, useTools } from "@/hooks/use-tools";
import { Plug } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";
import { Tooltip } from "./ui/tooltip";
import { Flex } from "./ui/flex";
import { Type } from "./ui/text";
import { ConnectIcon } from "hugeicons-react";
export type TPluginSelect = {
  selectedAssistantKey: string;
};

export const PluginSelect = ({ selectedAssistantKey }: TPluginSelect) => {
  const [isOpen, setIsOpen] = useState(false);
  const { tools } = useTools();
  const { getAssistantByKey } = useModelList();
  const { preferences, updatePreferences } = usePreferenceContext();
  const availableTools = tools.filter((tool) => tool.showInMenu);
  const availableToolsKey = availableTools.map((tool) => tool.key);
  const [selectedPlugins, setSelectedPlugins] = useState<TToolKey[]>([]);
  useEffect(() => {
    setSelectedPlugins(
      preferences.defaultPlugins?.filter((p) =>
        availableToolsKey.includes(p)
      ) || []
    );
  }, [isOpen, preferences]);

  const assistantProps = getAssistantByKey(selectedAssistantKey);

  if (!assistantProps?.model?.plugins?.length) {
    return null;
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip content="Tools">
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="px-2">
              <ConnectIcon size={16} strokeWidth="2" />
              <Badge>{selectedPlugins.length}</Badge>
            </Button>
          </PopoverTrigger>
        </Tooltip>
        <PopoverContent
          className="p-0 w-[340px] dark:bg-zinc-700 mr-8 rounded-2xl"
          side="top"
        >
          <p className="flex flex-row gap-2 py-2 px-3 text-sm font-medium border-b border-zinc-500/20">
            Tools
          </p>
          <div className="flex flex-col p-1">
            {availableTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.key}
                  className="flex text-xs md:text-sm gap-3 flex-row items-center w-full px-3 py-2 hover:bg-zinc-50 dark:hover:bg-black/30 rounded-2xl"
                >
                  <Icon size={20} strokeWidth={1.5} className="shrink-0" />
                  <div className="flex flex-col gap-0 items-start flex-1 min-w-0">
                    <Type size={"sm"} weight={"medium"} className="truncate w-full">
                      {tool.name}
                    </Type>
                    <Type
                      size={"xs"}
                      textColor={"tertiary"}
                      className="w-full leading-tight"
                    >
                      {tool.description}
                    </Type>
                  </div>
                  <Switch
                    className="shrink-0 ml-2"
                    checked={selectedPlugins.includes(tool.key)}
                    onCheckedChange={async (checked) => {
                      const defaultPlugins = preferences.defaultPlugins || [];
                      const isValidated = await tool?.validate?.();

                      if (checked) {
                        if (tool?.validate === undefined || isValidated) {
                          updatePreferences({
                            defaultPlugins: [...defaultPlugins, tool.key],
                          });
                          setSelectedPlugins([...selectedPlugins, tool.key]);
                        } else {
                          tool?.validationFailedAction?.();
                        }
                      } else {
                        updatePreferences({
                          defaultPlugins: defaultPlugins.filter(
                            (plugin) => plugin !== tool.key
                          ),
                        });
                        setSelectedPlugins(
                          selectedPlugins.filter(
                            (plugin) => plugin !== tool.key
                          )
                        );
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
