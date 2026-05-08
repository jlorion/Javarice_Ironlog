import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * ──────────────────────────────────────────────────────────────
 * Heavy Equipment Tracking System — Complete Schema (Phase 1)
 * ──────────────────────────────────────────────────────────────
 *
 * Tables:
 *   1. equipment          — Equipment registry
 *   2. sites              — Construction sites with coordinates
 *   3. equipmentAssignments — Equipment ↔ Site assignments
 *   4. keyAuditLogs       — Key checkout/return audit trail
 *   5. activityLogs       — System logs (equipment lifecycle + assignments)
 *   6. userRoles          — RBAC role assignments
 * ──────────────────────────────────────────────────────────────
 */

export const EquipmentStatus = v.union(
  v.literal("Available"),
  v.literal("Deployed"),
  v.literal("Under Maintenance"),
  v.literal("Decommissioned"),
);

export const KeyStatus = v.union(
  v.literal("Key In"),
  v.literal("Key Out"),
);

export const SiteStatus = v.union(
  v.literal("Active"),
  v.literal("Inactive"),
);

export const ActivityCategory = v.union(
  v.literal("equipment"),
  v.literal("assignment"),
);

export const ActivityAction = v.union(
  v.literal("registered"),
  v.literal("updated"),
  v.literal("decommissioned"),
  v.literal("assigned"),
  v.literal("unassigned"),
);

export const UserRole = v.union(
  v.literal("Admin"),
  v.literal("Fleet Manager"),
  v.literal("Site Supervisor"),
  v.literal("Operations Manager"),
  v.literal("Viewer"),
);

export default defineSchema({
  /**
   * ── Equipment ──
   * Central registry of all heavy equipment.
   */
  equipment: defineTable({
    name: v.string(),
    type: v.string(),
    serialNumber: v.string(),
    status: EquipmentStatus,
    acquisitionDate: v.string(), // YYYY-MM-DD
    keyStatus: KeyStatus,
    decommissionedAt: v.optional(v.number()), // epoch ms
  })
    .index("by_serialNumber", ["serialNumber"])
    .index("by_status", ["status"])
    .index("by_keyStatus", ["keyStatus"]),

  /**
   * ── Sites ──
   * Construction sites with geo coordinates for map visualization.
   */
  sites: defineTable({
    name: v.string(),
    location: v.string(), // Human-readable address
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    status: SiteStatus,
  })
    .index("by_status", ["status"]),

  /**
   * ── Equipment Assignments ──
   * Links equipment to sites. Historical assignments are kept
   * (unassignedAt is set) for audit purposes.
   */
  equipmentAssignments: defineTable({
    equipmentId: v.id("equipment"),
    siteId: v.id("sites"),
    assignedBy: v.string(), // userId or email
    assignedAt: v.number(), // epoch ms
    unassignedAt: v.optional(v.number()),
    unassignedBy: v.optional(v.string()),
    unassignedReason: v.optional(v.string()),
  })
    .index("by_equipmentId", ["equipmentId"])
    .index("by_siteId", ["siteId"])
    .index("by_equipmentId_active", ["equipmentId", "unassignedAt"])
    .index("by_siteId_active", ["siteId", "unassignedAt"]),

  /**
   * ── Key Audit Logs ──
   * Tracks who checks out / returns equipment keys.
   */
  keyAuditLogs: defineTable({
    equipmentId: v.id("equipment"),
    action: v.union(v.literal("Key Checked Out"), v.literal("Key Returned")),
    performedBy: v.string(),
    timestamp: v.number(),
    status: KeyStatus, // resulting status after the action
  })
    .index("by_equipmentId", ["equipmentId"])
    .index("by_performedBy", ["performedBy"])
    .index("by_equipmentId_timestamp", ["equipmentId", "timestamp"]),

  /**
   * ── Activity Logs ──
   * System logs for equipment lifecycle events and site assignments.
   */
  activityLogs: defineTable({
    category: ActivityCategory,
    entityType: v.union(v.literal("equipment"), v.literal("site")),
    entityId: v.string(), // id("equipment") or id("sites")
    action: ActivityAction,
    performedBy: v.string(),
    details: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_category_timestamp", ["category", "timestamp"])
    .index("by_timestamp", ["timestamp"]),

  /**
   * ── User Roles ──
   * RBAC role assignments per user.
   */
  userRoles: defineTable({
    userId: v.string(),
    role: UserRole,
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"]),
});
