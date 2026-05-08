import { api } from "@project-construction/backend/convex/_generated/api";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
    const userRole = useQuery(api.rbac.getCurrentRole);

    return (
        <header className="border-b border-border bg-card">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                <div className="flex flex-col">
                    <Link to="/" className="il-display text-lg text-foreground">
                        IronLog
                    </Link>
                    <span className="text-sm text-muted-foreground">
                        Field Operations Console
                        {userRole && (
                            <span className="ml-2 border border-border px-1.5 py-0.5 text-xs uppercase tracking-wider">
                                {userRole}
                            </span>
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}