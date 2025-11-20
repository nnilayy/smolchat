import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import {
  ConfirmProvider,
  DocumentProvider,
  PreferenceProvider,
  ReactQueryProvider,
  SessionsProvider,
  SettingsProvider,
} from "@/context";
import { cn } from "@/lib/utils";
import { interVar } from "./fonts";

export const metadata: Metadata = {
  title: "SmolChat",
  description: "Most intutive all-in-one AI chat client",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(`${interVar.variable} font-sans`, "antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <TooltipProvider>
              <ConfirmProvider>
                <PreferenceProvider>
                  <DocumentProvider>
                    <SessionsProvider>
                      <SettingsProvider>{children}</SettingsProvider>
                    </SessionsProvider>
                  </DocumentProvider>
                </PreferenceProvider>
              </ConfirmProvider>
            </TooltipProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
