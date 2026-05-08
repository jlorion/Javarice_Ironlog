import { createFileRoute } from "@tanstack/react-router";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Badge } from "@project-construction/ui/components/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@project-construction/ui/components/table";

export const Route = createFileRoute("/audit-log")({
    component: AuditLogPage,
});

const actionConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    registered: { label: "Registered", variant: "default" },
    updated: { label: "Updated", variant: "secondary" },
    decommissioned: { label: "Decommissioned", variant: "destructive" },
    assigned: { label: "Assigned", variant: "default" },
    unassigned: { label: "Unassigned", variant: "outline" },
};

function AuditLogPage() {
    const { data: logs, isLoading } = useAuditLog();

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-4 lg:px-8">
                <h1 className="il-display text-2xl text-foreground">Audit Log</h1>
                <div className="border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading activity logs...
                </div>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col gap-6 p-4 lg:px-8">
                <h1 className="il-display text-2xl text-foreground">Audit Log</h1>
                <div className="border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                    No activity logs yet.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 lg:px-8">
            <div>
                <h1 className="il-display text-2xl text-foreground">Audit Log</h1>
                <p className="text-sm text-muted-foreground">
                    System-wide activity and equipment lifecycle events.
                </p>
            </div>

            <div className="border border-border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Performed By</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => {
                            const config = actionConfig[log.action] ?? {
                                label: log.action,
                                variant: "outline" as const,
                            };
                            return (
                                <TableRow key={log.id}>
                                    <TableCell className="il-timestamp text-xs whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={config.variant} className="rounded-sm">
                                            {config.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {log.performedBy}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {log.details}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}