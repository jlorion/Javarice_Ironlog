import { api } from "@project-construction/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import type { Role } from "@/lib/permissions";

export function useAuth() {
    const user = useQuery(api.auth.getCurrentUser);
    const userRole = useQuery(api.rbac.getCurrentRole);

    // Map backend role string to frontend Role type
    const role: Role = (userRole === "Fleet Manager"
        ? "FleetManager"
        : userRole === "Site Supervisor"
            ? "SiteSupervisor"
            : userRole === "Operations Manager"
                ? "OperationsManager"
                : (userRole as Role)) ?? "Viewer";

    return {
        currentUser: user
            ? { id: user._id, name: user.name ?? user.email ?? "User" }
            : null,
        role,
        setRole: () => {
            // Role is managed server-side; no-op on client
        },
    };
}