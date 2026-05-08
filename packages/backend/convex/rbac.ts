import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import type { GenericCtx } from "@convex-dev/better-auth";
import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel";
import type { UserRole, Permission } from "@project-construction/types";

/**
 * Context type that works for both queries and mutations.
 * Used by RBAC helpers that need both auth (better-auth) and db access.
 */
type AppCtx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;

/**
 * Role → Permissions mapping.
 * "*" means full access (Admin).
 */
export const RolePermissions: Record<UserRole, readonly string[]> = {
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

/**
 * Get the role record for the currently authenticated user.
 * Returns `null` if no role is assigned (should default to Viewer or deny).
 */
export async function getUserRole(
  ctx: AppCtx,
): Promise<UserRole | null> {
  const user = await authComponent.safeGetAuthUser(ctx as GenericCtx<DataModel>);
  if (!user) return null;

  const roleRecord = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .first();

  return (roleRecord?.role as UserRole) ?? null;
}

/**
 * Check if the current user has a specific permission.
 * Admin ("*") always passes.
 */
export function hasPermission(role: UserRole | null, permission: Permission): boolean {
  if (!role) return false;
  const perms = RolePermissions[role];
  return perms.includes("*") || perms.includes(permission);
}

/**
 * Throw if the user does not have the required permission.
 */
export async function requirePermission(
  ctx: AppCtx,
  permission: Permission,
): Promise<UserRole> {
  const role = await getUserRole(ctx);
  if (!role || !hasPermission(role, permission)) {
    throw new Error("You do not have permission to perform this action");
  }
  return role;
}

/**
 * Throw if the user is not one of the allowed roles.
 */
export async function requireRole(
  ctx: AppCtx,
  allowedRoles: UserRole[],
): Promise<UserRole> {
  const role = await getUserRole(ctx);
  if (!role || !allowedRoles.includes(role)) {
    throw new Error("You do not have permission to perform this action");
  }
  return role;
}

/**
 * Query: get current user's role.
 */
export const getCurrentRole = query({
  args: {},
  handler: async (ctx) => {
    const role = await getUserRole(ctx);
    return role;
  },
});

/**
 * Query: list all role assignments (Admin only).
 */
export const listUserRoles = query({
  args: {},
  handler: async (ctx) => {
    await requirePermission(ctx, "*" as Permission);
    return await ctx.db.query("userRoles").collect();
  },
});

/**
 * Mutation: assign a role to a user (Admin only).
 */
export const assignRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(
      v.literal("Admin"),
      v.literal("Fleet Manager"),
      v.literal("Site Supervisor"),
      v.literal("Operations Manager"),
      v.literal("Viewer"),
    ),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "*" as Permission);

    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role });
      return existing._id;
    }

    return await ctx.db.insert("userRoles", {
      userId: args.userId,
      role: args.role,
    });
  },
});
