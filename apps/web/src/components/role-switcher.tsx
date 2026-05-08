import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/lib/permissions";

export function RoleSwitcher() {
    const { role, setRole } = useAuth();

    const roles: Role[] = [
        "Admin",
        "FleetManager",
        "SiteSupervisor",
        "OperationsManager",
        "Viewer",
    ];

    return (
        <div className="fixed bottom-4 right-4 z-50 rounded-md border border-border bg-card p-2 shadow-lg">
            <label
                htmlFor="role-switcher"
                className="text-xs text-muted-foreground block mb-1"
            >
                Dev Role Switcher
            </label>
            <select
                id="role-switcher"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-background border border-input rounded text-sm p-1 text-foreground"
            >
                {roles.map((r) => (
                    <option key={r} value={r}>
                        {r}
                    </option>
                ))}
            </select>
        </div>
    );
}
