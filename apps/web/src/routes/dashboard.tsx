import { createFileRoute } from "@tanstack/react-router";
import IronLogDashboard from "@/components/ironlog-dashboard";

export const Route = createFileRoute("/dashboard")({
    component: IronLogDashboard,
});
