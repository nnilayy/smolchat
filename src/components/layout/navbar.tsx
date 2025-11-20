import {
  useSessionsContext,
  useSettingsContext,
} from "@/context";
import { Gear } from "@phosphor-icons/react";
import {
  Moon02Icon,
  MoreHorizontalIcon,
  NoteIcon,
  PlusSignIcon,
  Sun01Icon,
} from "hugeicons-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { HistorySidebar } from "../history/history-side-bar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Flex } from "../ui/flex";
import { Tooltip } from "../ui/tooltip";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { open: openSettings } = useSettingsContext();
  const [isOpen, setIsOpen] = useState(false);
  const { createSession } = useSessionsContext();

  return (
    <div className="absolute z-[50] flex flex-col justify-center items-center gap-3 pb-6 md:p-3 top-0 bottom-0 left-0 w-12 md:w-14 bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700">
      <div className="flex flex-col gap-2 items-center pt-4">
        <HistorySidebar />
      </div>
      <Flex className="flex-1" />
      <Tooltip
        content={theme === "dark" ? "Light Mode" : "Dark Mode"}
        side="left"
        sideOffset={4}
      >
        <Button
          size="iconSm"
          variant="ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun01Icon size={20} strokeWidth="2" />
          ) : (
            <Moon02Icon size={20} strokeWidth="2" />
          )}
        </Button>
      </Tooltip>
      <Tooltip content="Preferences" side="left" sideOffset={4}>
        <Button
          size="iconSm"
          variant="ghost"
          onClick={() => {
            openSettings();
          }}
        >
          <Gear size={20} />
        </Button>
      </Tooltip>
      <DropdownMenu
        open={isOpen}
        onOpenChange={(open) => {
          document.body.style.pointerEvents = "auto";
          setIsOpen(open);
        }}
      >
        <Tooltip content="More" side="left" sideOffset={4}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="iconSm">
              <MoreHorizontalIcon size={20} />
            </Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent
          className="min-w-[250px] text-sm md:text-base mr-2"
          align="end"
          side="left"
          sideOffset={4}
        >
          <DropdownMenuItem onClick={() => {}}>About</DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>Feedback</DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>Support</DropdownMenuItem>
          <div className="my-1 h-[1px] bg-black/10 dark:bg-white/10 w-full" />

          <DropdownMenuItem
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
            }}
          >
            {theme === "light" ? (
              <Moon02Icon size={18} strokeWidth="2" />
            ) : (
              <Sun01Icon size={18} strokeWidth="2" />
            )}
            Switch to {theme === "light" ? "dark" : "light"} mode
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
