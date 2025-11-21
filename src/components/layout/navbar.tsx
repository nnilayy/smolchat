import {
  useSessionsContext,
  useSettingsContext,
} from "@/context";
import { Gear } from "@phosphor-icons/react";
import {
  Moon02Icon,
  NoteIcon,
  PlusSignIcon,
  Sun01Icon,
} from "hugeicons-react";
import { useTheme } from "next-themes";
import { HistorySidebar } from "../history/history-side-bar";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Tooltip } from "../ui/tooltip";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { open: openSettings } = useSettingsContext();
  const { createSession } = useSessionsContext();

  return (
    <div className="absolute z-[50] flex flex-row justify-between items-center px-4 h-14 top-0 left-0 right-0 bg-transparent pt-4">
      <div className="flex items-center">
        <HistorySidebar />
      </div>
      <Flex className="flex-1" />
      <Tooltip content="Preferences" side="bottom" sideOffset={4}>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            openSettings();
          }}
        >
          <Gear size={24} />
        </Button>
      </Tooltip>

    </div>
  );
};
