import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { requirePermission } from "./rbac";
import type { Permission } from "@project-construction/types";

/* ═══════════════════════════════════════════════════════════════
 *  QUERIES
 * ═══════════════════════════════════════════════════════════════ */

/**
 * List all sites, optionally filtered by status.
 */
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("Active"), v.literal("Inactive"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("sites")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("sites").order("desc").collect();
  },
});

/**
 * Get a single site by its Convex _id.
 */
export const getById = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.siteId);
  },
});

/**
 * Get all equipment currently assigned to a site.
 */
export const getAssignedEquipment = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    const allAssignments = await ctx.db
      .query("equipmentAssignments")
      .withIndex("by_siteId", (q) =>
        q.eq("siteId", args.siteId),
      )
      .collect();
    const assignments = allAssignments.filter((a) => a.unassignedAt === undefined);

    const equipment = await Promise.all(
      assignments.map((a) => ctx.db.get(a.equipmentId)),
    );

    return equipment.filter((e) => e !== null);
  },
});

/* ═══════════════════════════════════════════════════════════════
 *  MUTATIONS
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Create a new construction site.
 * RBAC: Admin or Fleet Manager.
 */
export const create = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    status: v.optional(v.union(v.literal("Active"), v.literal("Inactive"))),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "equipment:write" as Permission);

    const user = await authComponent.safeGetAuthUser(ctx);
    const performedBy = user?.email ?? "unknown";

    const siteId = await ctx.db.insert("sites", {
      name: args.name,
      location: args.location,
      coordinates: args.coordinates,
      status: args.status ?? "Active",
    });

    await ctx.db.insert("activityLogs", {
      category: "equipment",
      entityType: "site",
      entityId: siteId,
      action: "registered",
      performedBy,
      details: `Created site ${args.name} at ${args.location}`,
      timestamp: Date.now(),
    });

    return siteId;
  },
});

/**
 * Update site details.
 * RBAC: Admin or Fleet Manager.
 */
export const update = mutation({
  args: {
    siteId: v.id("sites"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    status: v.optional(v.union(v.literal("Active"), v.literal("Inactive"))),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "equipment:write" as Permission);

    const user = await authComponent.safeGetAuthUser(ctx);
    const performedBy = user?.email ?? "unknown";

    const site = await ctx.db.get(args.siteId);
    if (!site) {
      throw new Error(`Site not found: ${args.siteId}`);
    }

    const patch: Partial<typeof site> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.location !== undefined) patch.location = args.location;
    if (args.coordinates !== undefined) patch.coordinates = args.coordinates;
    if (args.status !== undefined) patch.status = args.status;

    await ctx.db.patch(args.siteId, patch);

    const changedFields = Object.keys(patch).join(", ");
    await ctx.db.insert("activityLogs", {
      category: "equipment",
      entityType: "site",
      entityId: args.siteId,
      action: "updated",
      performedBy,
      details: `Updated fields: ${changedFields}`,
      timestamp: Date.now(),
    });

    return args.siteId;
  },
});
