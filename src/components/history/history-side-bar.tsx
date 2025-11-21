import { useSessionsContext } from "@/context/sessions";
import { sortSessions } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { SidebarLeftIcon, PlusSignIcon } from "hugeicons-react";
import { ClockCounterClockwise, X } from "@phosphor-icons/react";
import { useState } from "react";
import { Drawer } from "vaul";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Tooltip } from "../ui/tooltip";
import { HistoryItem } from "./history-item";

export const HistorySidebar = () => {
  const { sessions, createSession, currentSession } = useSessionsContext();
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root direction="left" open={open} onOpenChange={setOpen}>
      <Tooltip content="Chat History" side="bottom" sideOffset={4}>
        <Drawer.Trigger asChild>
          <Button variant="ghost" size="icon">
            <SidebarLeftIcon size={24} strokeWidth="2" />
          </Button>
        </Drawer.Trigger>
      </Tooltip>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-zinc-500/70 dark:bg-zinc-900/70 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            "flex flex-col rounded-3xl outline-none h-[98dvh] w-[320px] fixed z-[101] md:bottom-2 left-2 top-2 "
          )}
        >
          <Drawer.Description className="sr-only">
            Chat History Sidebar
          </Drawer.Description>
          <div className="bg-zinc-100 dark:bg-zinc-900 h-[98dvh] border border-zinc-200 dark:border-zinc-700 flex flex-row rounded-2xl flex-1 p-2 relative">
            <div className="flex flex-col w-full overflow-y-auto no-scrollbar">
              <div className="flex flex-row justify-between">
                <div className="p-2">
                  <Flex
                    className="text-sm text-zinc-500"
                    items="center"
                    gap="sm"
                  >
                    <ClockCounterClockwise size={18} weight="bold" />
                    <Drawer.Title>Recent History</Drawer.Title>
                  </Flex>
                </div>

                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <X size={18} weight="bold" />
                </Button>
              </div>

              <div className="px-2 pb-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    createSession({
                      redirect: true,
                    });
                    setOpen(false);
                  }}
                >
                  <PlusSignIcon size={18} strokeWidth="2" />
                  New Chat
                </Button>
              </div>

              {sortSessions(sessions, "updatedAt")?.map((session) => (
                <HistoryItem
                  session={session as any}
                  key={session.id}
                  dismiss={() => {
                    setOpen(false);
                  }}
                />
              ))}
            </div>
            <div className="flex flex-col h-full justify-center items-center absolute right-[-20px] w-4">
              <div className="w-1 h-4 flex-shrink-0 rounded-full bg-white/50 mb-4" />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
