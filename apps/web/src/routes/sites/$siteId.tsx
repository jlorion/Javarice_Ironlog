import { api } from "@project-construction/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@project-construction/ui/components/button";
import { Badge } from "@project-construction/ui/components/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@project-construction/ui/components/table";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/sites/$siteId")({
    component: SiteDetailPage,
});

function SiteDetailPage() {
    const { siteId } = Route.useParams();
    const site = useQuery(api.sites.getById, { siteId: siteId as any });
    const assignedEquipment = useQuery(api.sites.getAssignedEquipment, {
        siteId: siteId as any,
    });

    if (!site) {
        return <div className="p-4">Loading site...</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-4 lg:px-8 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.history.back()}
                    className="il-touch"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="il-display text-2xl text-foreground">
                        {site.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {site.location}
                    </p>
                </div>
                <Badge
                    variant={site.status === "Active" ? "default" : "secondary"}
                    className="ml-auto"
                >
                    {site.status}
                </Badge>
            </div>

            <section className="border border-border bg-card p-6 flex flex-col gap-4">
                <h2 className="il-section-label">Site Details</h2>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="flex justify-between border-b border-border py-2">
                        <span className="text-muted-foreground">Location</span>
                        <span className="text-foreground">{site.location}</span>
                    </div>
                    <div className="flex justify-between border-b border-border py-2">
                        <span className="text-muted-foreground">Coordinates</span>
                        <span className="text-foreground font-mono">
                            {site.coordinates.lat.toFixed(4)}, {site.coordinates.lng.toFixed(4)}
                        </span>
                    </div>
                </div>
            </section>

            <section className="border border-border bg-card p-6 flex flex-col gap-4">
                <h2 className="il-section-label">Deployed Equipment</h2>
                {!assignedEquipment || assignedEquipment.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No equipment currently deployed at this site.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Serial Number</TableHead>
                                <TableHead>Key Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignedEquipment.map((eq) => (
                                <TableRow key={eq._id}>
                                    <TableCell className="font-medium">
                                        <Link
                                            to="/equipment/$equipmentId"
                                            params={{ equipmentId: eq._id }}
                                            className="hover:underline"
                                        >
                                            {eq.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{eq.type}</TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {eq.serialNumber}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                eq.keyStatus === "Key Out"
                                                    ? "destructive"
                                                    : "secondary"
                                            }
                                            className="rounded-sm"
                                        >
                                            {eq.keyStatus}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </section>
        </div>
    );
}