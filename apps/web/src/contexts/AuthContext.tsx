import React, { createContext, useContext, useState } from "react";
import { Role } from "@/lib/permissions";

interface User {
    id: string;
    name: string;
}

interface AuthContextType {
    currentUser: User | null;
    role: Role;
    setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Mock current user
    const [currentUser] = useState<User>({ id: "user-1", name: "Mock User" });
    const [role, setRole] = useState<Role>("Admin");

    return (
        <AuthContext.Provider value={{ currentUser, role, setRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}
