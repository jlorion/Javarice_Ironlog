import { useQuery, useMutation } from "convex/react";
import { api } from "@project-construction/backend/convex/_generated/api";
import { toast } from "sonner";

export function RoleSwitcher() {
    const userRole = useQuery(api.rbac.getCurrentRole);
    const user = useQuery(api.auth.getCurrentUser);
    const bootstrapAdmin = useMutation(api.rbac.bootstrapAdmin);

    const handleBootstrap = async () => {
        try {
            await bootstrapAdmin({});
            toast.success("Promoted to Admin!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed");
        }
    };

    const roleLabel =
        userRole === "Fleet Manager"
            ? "Fleet Manager"
            : userRole === "Site Supervisor"
                ? "Site Supervisor"
                : userRole === "Operations Manager"
                    ? "Operations Manager"
                    : userRole === "Admin"
                        ? "Admin"
                        : "Viewer";

    return (
        <div className="fixed bottom-4 right-4 z-50 rounded-md border border-border bg-card p-2 shadow-lg">
            <span className="text-xs text-muted-foreground block mb-1">
                Role: <strong>{roleLabel}</strong> · {user?.email ?? ""}
            </span>
            {userRole !== "Admin" && (
                <button
                    onClick={handleBootstrap}
                    className="text-xs text-primary hover:underline"
                >
                    Promote to Admin →
                </button>
            )}
        </div>
    );
}