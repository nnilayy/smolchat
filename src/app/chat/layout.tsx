import { MainLayout } from "@/components/layout/main-layout";
import {
  AssistantsProvider,
  ChatProvider,
  FiltersProvider,
} from "@/context";
import React from "react";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChatProvider>
      <FiltersProvider>
        <AssistantsProvider>
          <MainLayout>{children}</MainLayout>
        </AssistantsProvider>
      </FiltersProvider>
    </ChatProvider>
  );
}
