import { SettingsContainer } from "./settings-container";
import { SettingCard } from "./setting-card";
import { Flex } from "../ui/flex";
import { Type } from "../ui/text";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ArrowDown01Icon } from "hugeicons-react";

export const VoiceInput = () => {
  return (
    <SettingsContainer title="Speech">
      <SettingCard className="justify-center flex flex-col p-3">
        <Flex justify={"between"} items={"center"} className="w-full">
          <Flex direction={"col"} items={"start"} className="gap-1">
            <Type textColor={"primary"} weight={"medium"}>
              Speech to Text Model
            </Type>
            <Type size={"xs"} textColor={"tertiary"}>
              To get text from your voice using mic
            </Type>
          </Flex>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-[150px] justify-between"
              >
                Default
                <ArrowDown01Icon size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Default</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Flex>
      </SettingCard>

      <SettingCard className="justify-center flex flex-col p-3">
        <Flex justify={"between"} items={"center"} className="w-full">
          <Flex direction={"col"} items={"start"} className="gap-1">
            <Type textColor={"primary"} weight={"medium"}>
              Text to Speech Model
            </Type>
            <Type size={"xs"} textColor={"tertiary"}>
              To read out loud responded message
            </Type>
          </Flex>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-[150px] justify-between"
              >
                Default
                <ArrowDown01Icon size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Default</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Flex>
      </SettingCard>
    </SettingsContainer>
  );
};
