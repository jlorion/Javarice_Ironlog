import { useMockData } from "@/contexts/MockDataContext";
import { Assignment } from "@/types";

export function useAssignments() {
    // TODO(backend): replace with Convex query
    const { assignments, setAssignments } = useMockData();

    const addAssignment = (asn: Assignment) => {
        setAssignments((prev) => [...prev, asn]);
    };

    const updateAssignment = (id: string, partial: Partial<Assignment>) => {
        setAssignments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, ...partial } : a)),
        );
    };

    return {
        data: assignments,
        isLoading: false,
        addAssignment,
        updateAssignment,
    };
}
