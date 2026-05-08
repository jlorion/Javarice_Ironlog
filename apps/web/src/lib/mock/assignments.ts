import { Assignment } from "@/types";

export const initialMockAssignments: Assignment[] = [
    {
        id: "asn-1",
        equipmentId: "eq-3", // Komatsu PC200
        siteId: "site-1", // Damosa Gateway Phase 2
        assignedAt: new Date(Date.now() - 10000000).toISOString(),
        assignedBy: "Juan dela Cruz",
    },
    {
        id: "asn-2",
        equipmentId: "eq-9", // Hitachi ZX350
        siteId: "site-2", // SM Davao Expansion Block C
        assignedAt: new Date(Date.now() - 20000000).toISOString(),
        assignedBy: "Pedro Reyes",
    },
];
