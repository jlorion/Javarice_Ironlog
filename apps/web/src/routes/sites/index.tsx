import { api } from "@project-construction/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@project-construction/ui/components/table";
import { Badge } from "@project-construction/ui/components/badge";

export const Route = createFileRoute("/sites/")({
    component: SitesPage,
});

function SitesPage() {
    const sites = useQuery(api.sites.list, {});

    return (
        <div className="flex flex-col gap-6 p-4 lg:px-8">
            <div>
                <h1 className="il-display text-2xl text-foreground">Sites</h1>
                <p className="text-sm text-muted-foreground">
                    Construction sites and their deployment status.
                </p>
            </div>

            <div className="border border-border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Coordinates</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!sites ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Loading sites...
                                </TableCell>
                            </TableRow>
                        ) : sites.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No sites found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sites.map((site) => (
                                <TableRow key={site._id}>
                                    <TableCell className="font-medium">
                                        <Link
                                            to="/sites/$siteId"
                                            params={{ siteId: site._id }}
                                            className="hover:underline"
                                        >
                                            {site.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{site.location}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                site.status === "Active"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className="rounded-sm"
                                        >
                                            {site.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-muted-foreground">
                                        {site.coordinates.lat.toFixed(4)},{" "}
                                        {site.coordinates.lng.toFixed(4)}
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