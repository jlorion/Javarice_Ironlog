import { api } from "@project-construction/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export function useAssignments() {
    const assignmentsList = useQuery(api.assignments.listActive) ?? [];
    const assign = useMutation(api.assignments.assign);
    const unassign = useMutation(api.assignments.unassign);

    const data = assignmentsList.map((a) => ({
        id: a._id,
        equipmentId: a.equipmentId,
        siteId: a.siteId,
        assignedAt: new Date(a.assignedAt).toISOString(),
        assignedBy: a.assignedBy,
        unassignedAt: a.unassignedAt
            ? new Date(a.unassignedAt).toISOString()
            : undefined,
        unassignReason: a.unassignedReason,
    }));

    const addAssignment = async (args: {
        equipmentId: string;
        siteId: string;
    }) => {
        await assign({
            equipmentId: args.equipmentId as any,
            siteId: args.siteId as any,
        });
    };

    const updateAssignment = async (
        id: string,
        partial: { unassignedAt?: string; unassignReason?: string },
    ) => {
        await unassign({
            equipmentId: id as any,
            reason: partial.unassignReason,
        });
    };

    return {
        data,
        isLoading: assignmentsList === undefined,
        addAssignment,
        updateAssignment,
    };
}