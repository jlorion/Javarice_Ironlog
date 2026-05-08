import { useMockData } from "@/contexts/MockDataContext";
import { Equipment } from "@/types";

export function useEquipment() {
    // TODO(backend): replace with Convex query
    const { equipment, setEquipment } = useMockData();

    const addEquipment = (newEq: Equipment) => {
        setEquipment((prev) => [...prev, newEq]);
    };

    const updateEquipment = (id: string, partial: Partial<Equipment>) => {
        setEquipment((prev) =>
            prev.map((eq) => (eq.id === id ? { ...eq, ...partial } : eq)),
        );
    };

    return {
        data: equipment,
        isLoading: false,
        addEquipment,
        updateEquipment,
    };
}
