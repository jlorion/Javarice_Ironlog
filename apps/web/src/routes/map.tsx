import { api } from "@project-construction/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Button } from "@project-construction/ui/components/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@project-construction/ui/components/table";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { useEquipment } from "@/hooks/useEquipment";

export const Route = createFileRoute("/map")({
    component: MapPage,
});

function MapPage() {
    const sites = useQuery(api.sites.list, {}) ?? [];
    const { data: equipment } = useEquipment();
    const assignments = useQuery(api.assignments.listActive) ?? [];

    const activeSites = sites.filter((s) => s.status === "Active");

    const siteDeployments = useMemo(() => {
        const equipmentById = new Map(equipment.map((eq) => [eq.id, eq]));
        const grouped: Record<string, string[]> = {};

        for (const assignment of assignments) {
            const eq = equipmentById.get(assignment.equipmentId);
            if (!eq || eq.status !== "Deployed") continue;
            const siteIdStr = assignment.siteId;
            if (!grouped[siteIdStr]) grouped[siteIdStr] = [];
            grouped[siteIdStr].push(eq.name);
        }

        return activeSites.map((site) => ({
            site: {
                id: site._id,
                name: site.name,
                location: site.location,
                coordinates: site.coordinates,
                isActive: site.status === "Active",
            },
            equipmentNames: grouped[site._id] ?? [],
            count: (grouped[site._id] ?? []).length,
        }));
    }, [activeSites, assignments, equipment]);

    return (
        <div className="flex flex-col gap-6 p-4 lg:px-8">
            <div>
                <h1 className="il-display text-xl">Site Map</h1>
                <p className="text-sm text-muted-foreground">
                    {activeSites.length} active sites with deployed equipment.
                </p>
            </div>

            <div className="border border-border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Site</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Coordinates</TableHead>
                            <TableHead className="text-right">
                                Deployed Units
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {siteDeployments.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-24 text-center"
                                >
                                    No active sites with deployed equipment.
                                </TableCell>
                            </TableRow>
                        ) : (
                            siteDeployments.map(({ site, equipmentNames, count }) => (
                                <TableRow key={site.id}>
                                    <TableCell className="font-medium">
                                        {site.name}
                                    </TableCell>
                                    <TableCell>{site.location}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground font-mono">
                                        {site.coordinates.lat.toFixed(4)},{" "}
                                        {site.coordinates.lng.toFixed(4)}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {count}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}