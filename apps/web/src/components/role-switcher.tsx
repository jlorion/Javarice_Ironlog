import { useAuth } from "@/hooks/useAuth";

export function RoleSwitcher() {
    const { role } = useAuth();

    return (
        <div className="fixed bottom-4 right-4 z-50 rounded-md border border-border bg-card p-2 shadow-lg">
            <span className="text-xs text-muted-foreground block mb-1">
                Role: <strong>{role}</strong>
            </span>
            <span className="text-[10px] text-muted-foreground">
                Managed by admin
            </span>
        </div>
    );
}