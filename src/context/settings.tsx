"use client";
import { CommonSettings } from "@/components/settings/common";
import { Data } from "@/components/settings/data";
import { MemorySettings } from "@/components/settings/memory";
import { ModelSettings } from "@/components/settings/models";
import { PluginSettings } from "@/components/settings/plugins";
import { RagSettings } from "@/components/settings/rag";
import { VoiceInput } from "@/components/settings/voice-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  BrainIcon,
  DashboardCircleIcon,
  Database02Icon,
  Settings03Icon,
  SparklesIcon,
  VoiceIcon,
} from "hugeicons-react";
import { useState } from "react";

import { createContext, useContext } from "react";

export type TSettingsContext = {
  open: (menu?: string, subMenu?: string) => void;
  dismiss: () => void;
  selectedSubMenu?: string;
};
export const SettingsContext = createContext<undefined | TSettingsContext>(
  undefined
);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingssProvider");
  }
  return context;
};

export type TSettingsProvider = {
  children: React.ReactNode;
};

export type TSettingMenuItem = {
  name: string;
  key: string;
  icon: () => React.ReactNode;
  component: React.ReactNode;
};
export const SettingsProvider = ({ children }: TSettingsProvider) => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("common");
  const [selectedSubMenu, setSelectedSubMenu] = useState<string | undefined>(
    undefined
  );

  const open = (key?: string, subKey?: string) => {
    setIsSettingOpen(true);
    setSelectedMenu(key || "common");
    setSelectedSubMenu(subKey);
  };

  const dismiss = () => {
    setIsSettingOpen(false);
    setSelectedSubMenu(undefined);
  };

  const settingMenu: TSettingMenuItem[] = [
    {
      name: "Common",
      icon: () => <Settings03Icon size={18} strokeWidth="2" />,
      key: "common",
      component: <CommonSettings />,
    },
    {
      name: "Models",
      icon: () => <SparklesIcon size={18} strokeWidth="2" />,
      key: "models",
      component: <ModelSettings />,
    },
    {
      name: "RAG Configuration",
      icon: () => <Database02Icon size={18} strokeWidth="2" />,
      key: "rag",
      component: <RagSettings />,
    },
    {
      name: "Plugins",
      icon: () => <DashboardCircleIcon size={18} strokeWidth="2" />,
      key: "plugins",
      component: <PluginSettings />,
    },
    {
      name: "Memories",
      icon: () => <BrainIcon size={18} strokeWidth="2" />,
      key: "memory",
      component: <MemorySettings />,
    },
    {
      name: "Speech",
      icon: () => <VoiceIcon size={18} strokeWidth="2" />,
      key: "voice-input",
      component: <VoiceInput />,
    },
    {
      name: "Chat Data",
      icon: () => <Database02Icon size={18} strokeWidth="2" />,
      key: "Your Data",
      component: <Data />,
    },
  ];

  const selectedMenuItem = settingMenu.find(
    (menu) => menu.key === selectedMenu
  );

  return (
    <SettingsContext.Provider value={{ open, dismiss, selectedSubMenu }}>
      {children}

      <Dialog
        open={isSettingOpen}
        onOpenChange={(open) => {
          setIsSettingOpen(open);
          if (!open) setSelectedSubMenu(undefined);
        }}
      >
        <DialogContent className="w-[96dvw] max-h-[80dvh] rounded-2xl md:min-w-[800px] gap-0 md:h-[600px] flex flex-col overflow-hidden border border-white/5 p-0">
          <div className="w-full px-4 py-3 border-b border-zinc-500/20">
            <p className="text-md font-medium">Settings</p>
          </div>
          <div className="flex flex-row w-full relative h-full overflow-hidden">
            <div className="w-[200px] md:w-[220px] shrink-0 px-2 py-2 h-full border-r border-zinc-500/10 overflow-y-auto no-scrollbar flex flex-col gap-2">
              {settingMenu.map((menu) => (
                <Button
                  variant={selectedMenu === menu.key ? "secondary" : "ghost"}
                  key={menu.key}
                  onClick={() => {
                    setSelectedMenu(menu.key);
                    setSelectedSubMenu(undefined);
                  }}
                  className="justify-start gap-2 px-2"
                  size="default"
                >
                  <div className="w-6 h-6 flex flex-row items-center justify-center">
                    {menu.icon()}
                  </div>
                  <span className="text-sm flex font-medium">{menu.name}</span>
                </Button>
              ))}
            </div>
            <div className="flex-1 h-full overflow-y-auto no-scrollbar">
              {selectedMenuItem?.component}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SettingsContext.Provider>
  );
};
