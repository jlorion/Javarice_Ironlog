import { Toaster } from "@project-construction/ui/components/sonner";
import {
    HeadContent,
    Outlet,
    createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { MockDataProvider } from "@/contexts/MockDataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleSwitcher } from "@/components/role-switcher";

import "../index.css";

export interface RouterAppContext {}

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
                <MockDataProvider>
                    <AuthProvider>
                        <div className="grid grid-rows-[auto_1fr] h-svh">
                            <Header />
                            <Outlet />
                        </div>
                        <Toaster richColors />
                        <RoleSwitcher />
                    </AuthProvider>
                </MockDataProvider>
            </ThemeProvider>
            <TanStackRouterDevtools position="bottom-left" />
        </>
    );
}
