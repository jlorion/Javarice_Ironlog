import { api } from "@project-construction/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import type { Role } from "@/lib/permissions";

export function useAuth() {
    const user = useQuery(api.auth.getCurrentUser);

    // PRESENTATION MODE: always Admin
    const role: Role = "Admin";

    return {
        currentUser: user
            ? { id: user._id, name: user.name ?? user.email ?? "User" }
            : null,
        role,
        setRole: () => {},
    };
}