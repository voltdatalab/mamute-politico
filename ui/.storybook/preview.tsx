import type { Decorator, Preview } from "@storybook/react-vite";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LoginModalProvider } from "@/components/auth/LoginModalProvider";
import { AccountModalProvider } from "@/components/auth/AccountModalProvider";
import { startStorybookMsw } from "../src/storybook/msw/browser";
import "@/index.css";
import "./preview.css";

function applyReducedMotionMarkup() {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.storybookReducedMotion = "true";
}

/** Stable QueryClient across hot reloads inside the decorator lifecycle. */
const queryClientSingleton = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 60 * 60_000,
    },
  },
});

const withProviders: Decorator = (Story) => (
  <QueryClientProvider client={queryClientSingleton}>
    <TooltipProvider delayDuration={0}>
      <Toaster />
      <Sonner />
      <LoginModalProvider>
        <AccountModalProvider>
          <MemoryRouter initialEntries={["/app/dashboard"]} basename="/app">
            <div className="min-h-[120px] min-w-[280px] bg-background p-4 text-foreground antialiased">
              <Story />
            </div>
          </MemoryRouter>
        </AccountModalProvider>
      </LoginModalProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const preview: Preview = {
  loaders: async () => {
    await startStorybookMsw();
    applyReducedMotionMarkup();
    return {};
  },
  decorators: [withProviders],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
