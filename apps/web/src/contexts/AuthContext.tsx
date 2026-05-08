import React, { createContext, useContext } from "react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { env } from "@project-construction/env/web";
import { ConvexReactClient } from "convex/react";
import { api } from "@project-construction/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import type { Role } from "@/lib/permissions";
import { authClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(env.VITE_CONVEX_URL, {
    expectAuth: true,
});

interface AuthContextType {
    currentUser: { id: string; name: string } | null;
    role: Role;
    setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthContextInner({ children }: { children: React.ReactNode }) {
    const user = useQuery(api.auth.getCurrentUser);

    // PRESENTATION MODE: always Admin
    const role: Role = "Admin";

    const currentUser = user
        ? { id: user._id, name: user.name ?? user.email ?? "User" }
        : null;

    return (
        <AuthContext.Provider
            value={{ currentUser, role, setRole: () => {} }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <ConvexBetterAuthProvider client={convex} authClient={authClient}>
            <AuthContextInner>{children}</AuthContextInner>
        </ConvexBetterAuthProvider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}