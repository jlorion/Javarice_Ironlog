import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
    return (
        <header className="border-b border-border bg-card">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                <div className="flex flex-col">
                    <Link to="/" className="il-display text-lg text-foreground">
                        IronLog
                    </Link>
                    <span className="text-sm text-muted-foreground">
                        Field Operations Console
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
