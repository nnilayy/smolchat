import { TAssistant } from "@/hooks/use-chat-session";
import { useModelList } from "@/hooks/use-model-list";
import { useState } from "react";
import { usePreferenceContext } from "@/context";
import { CommandItem } from "@/components/ui/command";
import { defaultPreferences } from "@/hooks/use-preferences";
import { Flex } from "@/components/ui/flex";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DotsThree, Pencil, TrashSimple } from "@phosphor-icons/react";

export type TAssistantItem = {
  assistant: TAssistant;
  onSelect: (assistant: TAssistant) => void;
  onDelete: (assistant: TAssistant) => void;
  onEdit: (assistant: TAssistant) => void;
};

export const AssistantItem = ({
  assistant,
  onSelect,
  onDelete,
  onEdit,
}: TAssistantItem) => {
  const { getAssistantByKey, getAssistantIcon } = useModelList();
  const assistantProps = getAssistantByKey(assistant.key);
  const [open, setOpen] = useState(false);
  const model = assistantProps?.model;
  const { updatePreferences } = usePreferenceContext();

  return (
    <CommandItem
      value={assistant.name}
      className="w-full"
      onSelect={() => {
        updatePreferences(
          {
            defaultAssistant: assistant.key,
            maxTokens: defaultPreferences.maxTokens,
          },
          () => {
            onSelect(assistant);
          }
        );
      }}
    >
      <Flex gap={"sm"} items={"center"} key={assistant.key} className="w-full">
        {getAssistantIcon(assistant.key)}
        {assistant.name} {model?.isNew && <Badge>New</Badge>}
        <div className="flex flex-1"></div>
        {assistant.type === "custom" && (
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button
                variant={"ghost"}
                size={"iconSm"}
                onClick={(e) => {
                  setOpen(true);
                }}
              >
                <DotsThree size={20} weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-[200px] text-sm md:text-base z-[800]"
              align="end"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  onEdit(assistant);
                  e.stopPropagation();
                }}
              >
                <Pencil size={14} weight="bold" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  onDelete(assistant);
                  e.stopPropagation();
                }}
              >
                <TrashSimple size={14} weight="bold" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Flex>
    </CommandItem>
  );
};
