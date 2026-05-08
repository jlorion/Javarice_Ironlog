import { api } from "@project-construction/backend/convex/_generated/api";
import { Button } from "@project-construction/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@project-construction/ui/components/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const navigate = useNavigate();
  const user = useQuery(api.auth.getCurrentUser);
  const userRole = useQuery(api.rbac.getCurrentRole);
  const bootstrapAdmin = useMutation(api.rbac.bootstrapAdmin);

  const handleBootstrapAdmin = async () => {
    try {
      await bootstrapAdmin({});
      toast.success("You are now an Admin. Refreshing...");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to promote to Admin");
    }
  };

  const roleLabel =
    userRole === "Fleet Manager"
      ? "Fleet Manager"
      : userRole === "Site Supervisor"
        ? "Site Supervisor"
        : userRole === "Operations Manager"
          ? "Operations Manager"
          : userRole ?? "Viewer";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        {user?.name ?? user?.email ?? "Account"}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {user?.email && (
            <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
          )}
          <DropdownMenuItem disabled>
            Role: {roleLabel}
          </DropdownMenuItem>
          {userRole === "Viewer" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleBootstrapAdmin}>
                Promote to Admin
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({ to: "/login" });
                  },
                },
              });
            }}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}