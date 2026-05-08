import { api } from "@project-construction/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export function useSites() {
    const sitesList = useQuery(api.sites.list, {}) ?? [];

    const data = sitesList.map((site) => ({
        id: site._id,
        name: site.name,
        location: site.location,
        coordinates: site.coordinates,
        isActive: site.status === "Active",
        createdAt: new Date(site._creationTime).toISOString(),
    }));

    return {
        data,
        isLoading: sitesList === undefined,
    };
}