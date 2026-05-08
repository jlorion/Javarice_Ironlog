import { api } from "@project-construction/backend/convex/_generated/api";
import { useQuery } from "convex/react";

export function useAuditLog() {
    const activityLogs = useQuery(api.equipment.listAllActivityLogs) ?? [];

    const data = activityLogs.map((log) => ({
        id: log._id,
        category: log.category,
        action: log.action,
        performedBy: log.performedBy,
        details: log.details ?? undefined,
        timestamp: new Date(log.timestamp).toISOString(),
    }));

    // addAuditEntry is intentionally not implemented —
    // activity logs are created server-side as side effects of mutations
    return {
        data,
        isLoading: activityLogs === undefined,
    };
}