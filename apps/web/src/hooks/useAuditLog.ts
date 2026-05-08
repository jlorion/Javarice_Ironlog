import { useMockData } from "@/contexts/MockDataContext";
import { AuditEntry } from "@/types";

export function useAuditLog() {
    // TODO(backend): replace with Convex query
    const { auditLog, setAuditLog } = useMockData();

    const addAuditEntry = (entry: AuditEntry) => {
        setAuditLog((prev) => [entry, ...prev]);
    };

    return {
        data: auditLog,
        isLoading: false,
        addAuditEntry,
    };
}
