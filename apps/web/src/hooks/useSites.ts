import { useMockData } from "@/contexts/MockDataContext";

export function useSites() {
    // TODO(backend): replace with Convex query
    const { sites } = useMockData();

    return {
        data: sites,
        isLoading: false,
    };
}
