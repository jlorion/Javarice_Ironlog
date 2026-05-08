import { createFileRoute } from "@tanstack/react-router";

import IronLogLogin from "@/components/ironlog-login";

export const Route = createFileRoute("/login")({
    component: IronLogLogin,
});
