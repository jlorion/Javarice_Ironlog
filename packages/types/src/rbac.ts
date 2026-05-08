import { z } from "zod";

export const UserRole = z.enum([
  "Admin",
  "Fleet Manager",
  "Site Supervisor",
  "Operations Manager",
  "Viewer",
]);

export const RolePermissions = {
  Admin: ["*"],
  "Fleet Manager": [
    "equipment:read",
    "equipment:write",
    "map:read",
    "audit:read",
  ],
  "Site Supervisor": [
    "assignment:write",
    "map:read",
    "equipment:read",
  ],
  "Operations Manager": [
    "audit:write",
    "audit:read",
    "equipment:read",
  ],
  Viewer: [
    "equipment:read",
    "map:read",
  ],
} as const;

export const UserRoleSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  role: UserRole,
});

export type UserRole = z.infer<typeof UserRole>;
export type Permission = (typeof RolePermissions)[UserRole][number];
export type UserRoleRecord = z.infer<typeof UserRoleSchema>;
