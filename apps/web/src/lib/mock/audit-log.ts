import { AuditEntry } from "@/types";

export const initialMockAuditLog: AuditEntry[] = [
    {
        id: "audit-1",
        equipmentId: "eq-3",
        equipmentName: "Komatsu PC200",
        action: "Key Checked Out",
        performedBy: "Juan dela Cruz",
        timestamp: new Date(Date.now() - 5000000).toISOString(),
        keyStatus: "Key Out",
    },
    {
        id: "audit-2",
        equipmentId: "eq-3",
        equipmentName: "Komatsu PC200",
        action: "Key Returned",
        performedBy: "Juan dela Cruz",
        timestamp: new Date(Date.now() - 4000000).toISOString(),
        keyStatus: "Key In",
    },
    {
        id: "audit-3",
        equipmentId: "eq-3",
        equipmentName: "Komatsu PC200",
        action: "Key Checked Out",
        performedBy: "Maria Santos",
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        keyStatus: "Key Out",
    },
    {
        id: "audit-4",
        equipmentId: "eq-3",
        equipmentName: "Komatsu PC200",
        action: "Key Returned",
        performedBy: "Maria Santos",
        timestamp: new Date(Date.now() - 2000000).toISOString(),
        keyStatus: "Key In",
    },
    {
        id: "audit-5",
        equipmentId: "eq-3",
        equipmentName: "Komatsu PC200",
        action: "Key Checked Out",
        performedBy: "Juan dela Cruz",
        timestamp: new Date(Date.now() - 1000000).toISOString(),
        keyStatus: "Key Out",
    },
];
