import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sites/")({
    component: SitesPage,
});

function SitesPage() {
    return <div className="p-4">Sites List</div>;
}
