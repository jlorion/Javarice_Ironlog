import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Action, can } from "@/lib/permissions";

interface PermissionGuardProps {
    action: Action;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function PermissionGuard({
    action,
    children,
    fallback = null,
}: PermissionGuardProps) {
    const { role } = useAuth();

    if (can(role, action)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
