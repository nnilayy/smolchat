"use client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useChatSession } from "@/hooks/use-chat-session";
import {
  Chat,
  Eraser,
  Moon,
  Plus,
  StarFour,
  Sun,
  TrashSimple,
} from "@phosphor-icons/react";
import moment from "moment";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useModelList } from "@/hooks/use-model-list";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { sortSessions } from "@/lib/helper";
import {
  CommentAdd01Icon,
  Delete01Icon,
  Moon02Icon,
  Sun03Icon,
} from "hugeicons-react";

import { createContext, useContext } from "react";
import { useSessionsContext } from "./sessions";

export type TFilterContext = {
  open: () => void;
  dismiss: () => void;
};
export const FiltersContext = createContext<undefined | TFilterContext>(
  undefined
);

export const useFilterContext = () => {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
};

export type TFiltersProvider = {
  children: React.ReactNode;
};
export const FiltersProvider = ({ children }: TFiltersProvider) => {
  const {
    sessions,
    createSession,
    clearSessionsMutation,
    removeSessionMutation,
    currentSession,
    refetchSessions,
  } = useSessionsContext();

  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { getModelByKey, getAssistantByKey } = useModelList();
  const open = () => {
    refetchSessions?.();
    setIsFilterOpen(true);
  };
  const { toast, dismiss } = useToast();

  const onClose = () => setIsFilterOpen(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsFilterOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const actions = [
    {
      name: "New session",
      icon: CommentAdd01Icon,
      action: () => {
        createSession({
          redirect: true,
        });
        onClose();
      },
    },
    {
      name: `Switch to ${theme === "light" ? "dark" : "light"} mode`,
      icon: theme === "light" ? Moon02Icon : Sun03Icon,
      action: () => {
        setTheme(theme === "light" ? "dark" : "light");
        onClose();
      },
    },
    {
      name: "Delete current session",
      icon: Delete01Icon,
      action: () => {
        onClose();
        toast({
          title: "Delete Session?",
          description: "This action cannot be undone.",
          variant: "destructive",
          action: (
            <Button
              size={"sm"}
              variant={"default"}
              onClick={() => {
                currentSession?.id &&
                  removeSessionMutation.mutate(currentSession?.id, {
                    onSuccess() {
                      createSession({
                        redirect: true,
                      });
                      dismiss();
                    },
                  });
              }}
            >
              Delete
            </Button>
          ),
        });
      },
    },
  ];

  return (
    <FiltersContext.Provider value={{ open, dismiss: onClose }}>
      {children}

      <CommandDialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {actions.map((action) => (
              <CommandItem
                key={action.name}
                className="gap-2"
                value={action.name}
                onSelect={action.action}
              >
                <action.icon
                  size={18}
                  strokeWidth={"2"}
                  className="flex-shrink-0"
                />
                {action.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Sessions">
            {sortSessions(sessions, "updatedAt")?.map((session) => {
              const assistantProps = getAssistantByKey(
                session.messages?.[0]?.inputProps?.assistant?.key!
              );
              return (
                <CommandItem
                  key={session.id}
                  value={`${session.id}/${session.title}`}
                  className={cn(
                    "gap-2 w-full",
                    currentSession?.id === session.id
                      ? "bg-black/10 dark:bg-black/10"
                      : ""
                  )}
                  onSelect={(value) => {
                    router.push(`/chat/${session.id}`);
                    onClose();
                  }}
                >
                  {assistantProps?.model.icon("sm")}
                  <span className="w-full truncate">{session.title}</span>
                  <span className="pl-4 text-xs md:text-xs text-zinc-400 dark:text-zinc-700 flex-shrink-0">
                    {moment(session.createdAt).fromNow(true)}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </FiltersContext.Provider>
  );
};
