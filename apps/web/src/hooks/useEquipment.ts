import { api } from "@project-construction/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { EquipmentStatus } from "@/types";

export function useEquipment() {
    const equipmentList = useQuery(api.equipment.list, {}) ?? [];
    const register = useMutation(api.equipment.register);
    const update = useMutation(api.equipment.update);
    const decommission = useMutation(api.equipment.decommission);

    const data = equipmentList.map((eq) => ({
        id: eq._id,
        name: eq.name,
        type: eq.type,
        serialNumber: eq.serialNumber,
        status: eq.status as EquipmentStatus,
        keyStatus: eq.keyStatus as "Key In" | "Key Out",
        acquisitionDate: eq.acquisitionDate,
        createdAt: new Date(eq._creationTime).toISOString(),
        updatedAt: new Date(eq._creationTime).toISOString(),
    }));

    const addEquipment = async (newEq: {
        name: string;
        type: string;
        serialNumber: string;
        status: EquipmentStatus;
        keyStatus: "Key In" | "Key Out";
        acquisitionDate: string;
    }) => {
        await register({
            name: newEq.name,
            type: newEq.type,
            serialNumber: newEq.serialNumber,
            acquisitionDate: newEq.acquisitionDate,
            status: newEq.status,
        });
    };

    const updateEquipment = async (
        id: string,
        partial: {
            name?: string;
            type?: string;
            serialNumber?: string;
            status?: EquipmentStatus;
            acquisitionDate?: string;
        },
    ) => {
        if (partial.status === "Decommissioned") {
            await decommission({ equipmentId: id as any });
        } else {
            await update({
                equipmentId: id as any,
                name: partial.name,
                type: partial.type,
                serialNumber: partial.serialNumber,
                status: partial.status as any,
                acquisitionDate: partial.acquisitionDate,
            });
        }
    };

    return {
        data,
        isLoading: equipmentList === undefined,
        addEquipment,
        updateEquipment,
    };
}