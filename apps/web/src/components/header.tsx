import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
    return (
        <header className="border-b border-border bg-card">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col mr-4">
                        <Link
                            to="/"
                            className="il-display text-lg text-foreground"
                        >
                            IronLog
                        </Link>
                        <span className="text-sm text-muted-foreground hidden sm:block">
                            Field Operations Console
                        </span>
                    </div>
                    <nav className="flex items-center gap-4 text-sm font-medium">
                        <Link
                            to="/equipment"
                            className="[&.active]:text-primary text-muted-foreground hover:text-foreground"
                        >
                            Equipment
                        </Link>
                        <Link
                            to="/sites"
                            className="[&.active]:text-primary text-muted-foreground hover:text-foreground"
                        >
                            Sites
                        </Link>
                        <Link
                            to="/map"
                            className="[&.active]:text-primary text-muted-foreground hover:text-foreground"
                        >
                            Map
                        </Link>
                        <Link
                            to="/audit-log"
                            className="[&.active]:text-primary text-muted-foreground hover:text-foreground"
                        >
                            Audit Log
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
