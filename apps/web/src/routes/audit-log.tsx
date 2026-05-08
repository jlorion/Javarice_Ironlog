import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/audit-log")({
    component: AuditLogPage,
});

function AuditLogPage() {
    return <div className="p-4">Audit Log</div>;
}
