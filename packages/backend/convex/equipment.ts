import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { getUserRole, hasPermission, requirePermission } from "./rbac";
import type { EquipmentStatus, Permission } from "@project-construction/types";

/* ═══════════════════════════════════════════════════════════════
 *  QUERIES
 * ═══════════════════════════════════════════════════════════════ */

/**
 * List all equipment, optionally filtered by status.
 * Returns equipment sorted by creation time (newest first).
 */
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("Available"),
        v.literal("Deployed"),
        v.literal("Under Maintenance"),
        v.literal("Decommissioned"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("equipment")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("equipment").order("desc").collect();
  },
});

/**
 * Get a single piece of equipment by its Convex _id.
 */
export const getById = query({
  args: { equipmentId: v.id("equipment") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.equipmentId);
  },
});

/**
 * Check whether a piece of equipment currently has an active site assignment.
 * Used by decommission to guard against removing deployed equipment.
 */
export const isAssigned = internalQuery({
  args: { equipmentId: v.id("equipment") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("equipmentAssignments")
      .withIndex("by_equipmentId", (q) =>
        q.eq("equipmentId", args.equipmentId),
      )
      .collect();
    return all.some((a) => a.unassignedAt === undefined);
  },
});

/**
 * Get activity log entries for a specific equipment.
 */
export const getActivityLog = query({
  args: { equipmentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", "equipment").eq("entityId", args.equipmentId),
      )
      .order("desc")
      .collect();
  },
});

/**
 * Get all activity log entries, sorted by most recent first.
 */
export const listAllActivityLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();
  },
});

/* ═══════════════════════════════════════════════════════════════
 *  MUTATIONS
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Register a new piece of equipment.
 * Validates: serial number uniqueness.
 * Side-effect: creates an activity log entry.
 */
export const register = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    serialNumber: v.string(),
    status: v.optional(
      v.union(
        v.literal("Available"),
        v.literal("Deployed"),
        v.literal("Under Maintenance"),
        v.literal("Decommissioned"),
      ),
    ),
    acquisitionDate: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    // ── RBAC: Admin or Fleet Manager ──
    await requirePermission(ctx, "equipment:write" as Permission);

    const user = await authComponent.safeGetAuthUser(ctx);
    const performedBy = user?.email ?? "unknown";

    // ── Validation: duplicate serial number ──
    const existing = await ctx.db
      .query("equipment")
      .withIndex("by_serialNumber", (q) =>
        q.eq("serialNumber", args.serialNumber),
      )
      .first();

    if (existing) {
      throw new Error(
        `Equipment with this serial number already exists: ${args.serialNumber}`,
      );
    }

    // ── Insert ──
    const equipmentId = await ctx.db.insert("equipment", {
      name: args.name,
      type: args.type,
      serialNumber: args.serialNumber,
      status: args.status ?? "Available",
      acquisitionDate: args.acquisitionDate,
      keyStatus: "Key In",
    });

    // ── Activity log ──
    await ctx.db.insert("activityLogs", {
      category: "equipment",
      entityType: "equipment",
      entityId: equipmentId,
      action: "registered",
      performedBy,
      details: `Registered ${args.name} (${args.serialNumber})`,
      timestamp: Date.now(),
    });

    return equipmentId;
  },
});

/**
 * Update equipment details.
 * Validates: equipment must exist.
 * Side-effect: creates an activity log entry.
 */
export const update = mutation({
  args: {
    equipmentId: v.id("equipment"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("Available"),
        v.literal("Deployed"),
        v.literal("Under Maintenance"),
        v.literal("Decommissioned"),
      ),
    ),
    acquisitionDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // ── RBAC: Admin or Fleet Manager ──
    await requirePermission(ctx, "equipment:write" as Permission);

    const user = await authComponent.safeGetAuthUser(ctx);
    const performedBy = user?.email ?? "unknown";

    const equipment = await ctx.db.get(args.equipmentId);
    if (!equipment) {
      throw new Error(`Equipment not found: ${args.equipmentId}`);
    }

    // Build update patch (only provided fields)
    const patch: Partial<typeof equipment> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.type !== undefined) patch.type = args.type;
    if (args.serialNumber !== undefined) patch.serialNumber = args.serialNumber;
    if (args.status !== undefined) patch.status = args.status as EquipmentStatus;
    if (args.acquisitionDate !== undefined)
      patch.acquisitionDate = args.acquisitionDate;

    await ctx.db.patch(args.equipmentId, patch);

    // ── Activity log ──
    const changedFields = Object.keys(patch).join(", ");
    await ctx.db.insert("activityLogs", {
      category: "equipment",
      entityType: "equipment",
      entityId: args.equipmentId,
      action: "updated",
      performedBy,
      details: `Updated fields: ${changedFields}`,
      timestamp: Date.now(),
    });

    return args.equipmentId;
  },
});

/**
 * Decommission a piece of equipment.
 * Validates: equipment must exist AND must not be currently deployed.
 * Side-effect: creates an activity log entry.
 */
export const decommission = mutation({
  args: {
    equipmentId: v.id("equipment"),
  },
  handler: async (ctx, args) => {
    // ── RBAC: Admin or Fleet Manager ──
    await requirePermission(ctx, "equipment:write" as Permission);

    const user = await authComponent.safeGetAuthUser(ctx);
    const performedBy = user?.email ?? "unknown";

    const equipment = await ctx.db.get(args.equipmentId);
    if (!equipment) {
      throw new Error(`Equipment not found: ${args.equipmentId}`);
    }

    // ── Validation: must not be actively assigned ──
    const allAssignments = await ctx.db
      .query("equipmentAssignments")
      .withIndex("by_equipmentId", (q) =>
        q.eq("equipmentId", args.equipmentId),
      )
      .collect();
    const activeAssignment = allAssignments.find((a) => a.unassignedAt === undefined);

    if (activeAssignment) {
      throw new Error(
        "Equipment is currently deployed. Unassign it before decommissioning.",
      );
    }

    // ── Update ──
    await ctx.db.patch(args.equipmentId, {
      status: "Decommissioned",
      decommissionedAt: Date.now(),
    });

    // ── Activity log ──
    await ctx.db.insert("activityLogs", {
      category: "equipment",
      entityType: "equipment",
      entityId: args.equipmentId,
      action: "decommissioned",
      performedBy,
      details: `Decommissioned ${equipment.name}`,
      timestamp: Date.now(),
    });

    return args.equipmentId;
  },
});

/* ═══════════════════════════════════════════════════════════════
 *  KEY MANAGEMENT
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Check out a key: sets keyStatus to "Key Out".
 */
export const checkOutKey = mutation({
  args: {
    equipmentId: v.id("equipment"),
    performedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const performedBy = args.performedBy || user?.email || "unknown";

    const equipment = await ctx.db.get(args.equipmentId);
    if (!equipment) {
      throw new Error(`Equipment not found: ${args.equipmentId}`);
    }

    if (equipment.keyStatus === "Key Out") {
      throw new Error("Key is already checked out.");
    }

    await ctx.db.patch(args.equipmentId, { keyStatus: "Key Out" });

    await ctx.db.insert("keyAuditLogs", {
      equipmentId: args.equipmentId,
      action: "Key Checked Out",
      performedBy,
      timestamp: Date.now(),
      status: "Key Out",
    });

    await ctx.db.insert("activityLogs", {
      category: "equipment",
      entityType: "equipment",
      entityId: args.equipmentId,
      action: "updated",
      performedBy,
      details: `Key checked out from ${equipment.name} by ${performedBy}`,
      timestamp: Date.now(),
    });

    return args.equipmentId;
  },
});

/**
 * Return a key: sets keyStatus to "Key In".
 */
export const returnKey = mutation({
  args: {
    equipmentId: v.id("equipment"),
    performedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const performedBy = args.performedBy || user?.email || user?.name || "unknown";

    const equipment = await ctx.db.get(args.equipmentId);
    if (!equipment) {
      throw new Error(`Equipment not found: ${args.equipmentId}`);
    }

    if (equipment.keyStatus === "Key In") {
      throw new Error("Key is already returned.");
    }

    await ctx.db.patch(args.equipmentId, { keyStatus: "Key In" });

    await ctx.db.insert("keyAuditLogs", {
      equipmentId: args.equipmentId,
      action: "Key Returned",
      performedBy,
      timestamp: Date.now(),
      status: "Key In",
    });

    await ctx.db.insert("activityLogs", {
      category: "equipment",
      entityType: "equipment",
      entityId: args.equipmentId,
      action: "updated",
      performedBy,
      details: `Key returned for ${equipment.name} by ${performedBy}`,
      timestamp: Date.now(),
    });

    return args.equipmentId;
  },
});

/**
 * Get key audit logs for a specific equipment.
 */
export const getKeyAuditLog = query({
  args: { equipmentId: v.id("equipment") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("keyAuditLogs")
      .withIndex("by_equipmentId", (q) => q.eq("equipmentId", args.equipmentId))
      .order("desc")
      .collect();
  },
});
