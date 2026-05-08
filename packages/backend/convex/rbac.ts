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
 * Get the role for the currently authenticated user.
 * Returns "Viewer" if no role is assigned.
 */
export async function getUserRole(
  ctx: AppCtx,
): Promise<UserRole> {
  const user = await authComponent.safeGetAuthUser(ctx as GenericCtx<DataModel>);
  if (!user) return "Viewer" as UserRole;

  // Try matching by Convex _id first (most common case)
  const byId = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .first();
  if (byId) return byId.role as UserRole;

  // Fallback: also try matching by email (better-auth may store differently)
  const allRoles = await ctx.db.query("userRoles").collect();
  const match = allRoles.find(
    (r) => r.userId === user.email || r.userId === user._id,
  );
  if (match) {
    return match.role as UserRole;
  }

  return "Viewer" as UserRole;
}

/**
 * Check if the current user has a specific permission.
 * PRESENTATION MODE: all permissions granted.
 */
export function hasPermission(role: UserRole | null, permission: Permission): boolean {
  return true;
}

/**
 * Throw if the user does not have the required permission.
 * PRESENTATION MODE: always passes.
 */
export async function requirePermission(
  ctx: AppCtx,
  permission: Permission,
): Promise<UserRole> {
  const role = await getUserRole(ctx);
  return role;
}

/**
 * Throw if the user is not one of the allowed roles.
 * PRESENTATION MODE: always passes.
 */
export async function requireRole(
  ctx: AppCtx,
  allowedRoles: UserRole[],
): Promise<UserRole> {
  const role = await getUserRole(ctx);
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

/**
 * Mutation: promote the current user to Admin.
 * - If no Admin exists: promotes you (bootstrap)
 * - If you are already Admin: no-op
 * - If another Admin exists: throws an error
 */
export const bootstrapAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx as GenericCtx<DataModel>);
    if (!user) {
      throw new Error("You must be logged in to promote to Admin.");
    }

    // Check if any Admin already exists
    const allRoleAssignments = await ctx.db.query("userRoles").collect();
    const existingAdmin = allRoleAssignments.find((r) => r.role === "Admin");

    // Also check if current user has a role entry (by Convex _id or by email)
    const currentRoleEntry = allRoleAssignments.find(
      (r) => r.userId === user._id || r.userId === user.email,
    );

    // If current user is already Admin, return
    if (currentRoleEntry?.role === "Admin") {
      // Fix the userId to use the canonical Convex _id if it was stored differently
      if (currentRoleEntry.userId !== user._id) {
        await ctx.db.patch(currentRoleEntry._id, { userId: user._id });
      }
      return currentRoleEntry._id;
    }

    if (existingAdmin) {
      throw new Error(
        "An Admin already exists. Ask an existing Admin to assign your role.",
      );
    }

    // No Admin exists — promote the current user
    if (currentRoleEntry) {
      await ctx.db.patch(currentRoleEntry._id, { role: "Admin", userId: user._id });
      return currentRoleEntry._id;
    }

    return await ctx.db.insert("userRoles", {
      userId: user._id,
      role: "Admin",
    });
  },
});
