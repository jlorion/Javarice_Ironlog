import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sites/$siteId")({
    component: SiteDetailPage,
});

function SiteDetailPage() {
    const { siteId } = Route.useParams();
    return <div className="p-4">Site Detail: {siteId}</div>;
}
