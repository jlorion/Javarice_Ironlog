import { createFileRoute, redirect } from "@tanstack/react-router";
import IronLogDashboard from "@/components/ironlog-dashboard";

export const Route = createFileRoute("/dashboard")({
    beforeLoad: async ({ context }) => {
        const session = await context.authClient.getSession();
    },
    component: IronLogDashboard,
});
