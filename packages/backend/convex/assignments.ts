import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { requirePermission } from "./rbac";
import type { Permission } from "@project-construction/types";

/* ═══════════════════════════════════════════════════════════════
 *  QUERIES
 * ═══════════════════════════════════════════════════════════════ */

/**
 * List all active assignments.
 */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("equipmentAssignments")
      .order("desc")
      .collect();
    return all.filter((a) => a.unassignedAt === undefined);
  },
});

/**
 * Get active assignment for a specific equipment.
 */
export const getByEquipment = query({
  args: { equipmentId: v.id("equipment") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("equipmentAssignments")
      .withIndex("by_equipmentId", (q) =>
        q.eq("equipmentId", args.equipmentId),
      )
      .collect();
    return all.find((a) => a.unassignedAt === undefined) ?? null;
  },
});

/**
 * Get active assignments for a specific site.
 */
export const getBySite = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("equipmentAssignments")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .collect();
    return all.filter((a) => a.unassignedAt === undefined);
  },
});

/* ═══════════════════════════════════════════════════════════════
 *  MUTATIONS
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Assign equipment to a construction site.
 * Validates: equipment must be "Available", site must be "Active".
 * RBAC: Admin, Fleet Manager, or Site Supervisor.
 */
export const assign = mutation({
  args: {
    equipmentId: v.id("equipment"),
    siteId: v.id("sites"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "assignment:write" as Permission);

    const user = await authComponent.safeGetAuthUser(ctx);
    const performedBy = user?.email ?? "unknown";

    // ── Validation: equipment must exist and be Available ──
    const equipment = await ctx.db.get(args.equipmentId);
    if (!equipment) {
      throw new Error(`Equipment not found: ${args.equipmentId}`);
    }
    if (equipment.status === "Deployed") {
      throw new Error("Equipment is already deployed at another site");
    }
    if (equipment.status === "Under Maintenance") {
      throw new Error(
        "Equipment is under maintenance and cannot be assigned",
      );
    }
    if (equipment.status === "Decommissioned") {
      throw new Error("Equipment is decommissioned and cannot be assigned");
    }

    // ── Validation: site must exist and be Active ──
    const site = await ctx.db.get(args.siteId);
    if (!site) {
      throw new Error(`Site not found: ${args.siteId}`);
    }
    if (site.status !== "Active") {
      throw new Error("Cannot assign equipment to an inactive site");
    }

    // ── Validation: must not already be assigned ──
    const existingAssignments = await ctx.db
      .query("equipmentAssignments")
      .withIndex("by_equipmentId", (q) =>
        q.eq("equipmentId", args.equipmentId),
      )
      .collect();
    const existing = existingAssignments.find((a) => a.unassignedAt === undefined);

    if (existing) {
      throw new Error("Equipment is already deployed at another site");
    }

    // ── Insert assignment ──
    const assignmentId = await ctx.db.insert("equipmentAssignments", {
      equipmentId: args.equipmentId,
      siteId: args.siteId,
      assignedBy: performedBy,
      assignedAt: Date.now(),
    });

    // ── Update equipment status ──
    await ctx.db.patch(args.equipmentId, { status: "Deployed" });

    // ── Activity log ──
    await ctx.db.insert("activityLogs", {
      category: "assignment",
      entityType: "equipment",
      entityId: args.equipmentId,
      action: "assigned",
      performedBy,
      details: `Assigned ${equipment.name} to ${site.name}`,
      timestamp: Date.now(),
    });

    return assignmentId;
  },
});

/**
 * Unassign equipment from its current site.
 * Equipment status reverts to "Available".
 * RBAC: Admin, Fleet Manager, or Site Supervisor.
 */
export const unassign = mutation({
  args: {
    equipmentId: v.id("equipment"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "assignment:write" as Permission);

    const user = await authComponent.safeGetAuthUser(ctx);
    const performedBy = user?.email ?? "unknown";

    // ── Find active assignment ──
    const allAssignments = await ctx.db
      .query("equipmentAssignments")
      .withIndex("by_equipmentId", (q) =>
        q.eq("equipmentId", args.equipmentId),
      )
      .collect();
    const assignment = allAssignments.find((a) => a.unassignedAt === undefined);

    if (!assignment) {
      throw new Error("Equipment is not currently assigned to any site");
    }

    const equipment = await ctx.db.get(args.equipmentId);
    const site = await ctx.db.get(assignment.siteId);

    // ── Update assignment ──
    await ctx.db.patch(assignment._id, {
      unassignedAt: Date.now(),
      unassignedBy: performedBy,
      unassignedReason: args.reason ?? "",
    });

    // ── Revert equipment status ──
    await ctx.db.patch(args.equipmentId, { status: "Available" });

    // ── Activity log ──
    await ctx.db.insert("activityLogs", {
      category: "assignment",
      entityType: "equipment",
      entityId: args.equipmentId,
      action: "unassigned",
      performedBy,
      details: `Unassigned ${equipment?.name ?? "equipment"} from ${site?.name ?? "site"}${args.reason ? ` (reason: ${args.reason})` : ""}`,
      timestamp: Date.now(),
    });

    return assignment._id;
  },
});
