import { Toaster } from "@project-construction/ui/components/sonner";
import {
    HeadContent,
    Outlet,
    createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

import "../index.css";

import { authClient } from "@/lib/auth-client";

export interface RouterAppContext {
  authClient: typeof authClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
    component: RootComponent,
    head: () => ({
        meta: [
            {
                title: "IronLog",
            },
            {
                name: "description",
                content: "IronLog field equipment tracking dashboard",
            },
        ],
        links: [
            {
                rel: "icon",
                href: "/favicon.ico",
            },
        ],
    }),
});

function RootComponent() {
    return (
        <>
            <HeadContent />
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                disableTransitionOnChange
                storageKey="vite-ui-theme"
            >
                <div className="grid grid-rows-[auto_1fr] h-svh">
                    <Header />
                    <Outlet />
                </div>
                <Toaster richColors />
            </ThemeProvider>
            <TanStackRouterDevtools position="bottom-left" />
        </>
    );
}
