import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { ActivityCategory, ActivityAction } from "@project-construction/types";

/**
 * Internal helper to create an activity log entry.
 * Called by other mutations — not exposed directly to clients.
 */
export const createActivityLog = mutation({
  args: {
    category: v.union(v.literal("equipment"), v.literal("assignment")),
    entityType: v.union(v.literal("equipment"), v.literal("site")),
    entityId: v.string(),
    action: v.union(
      v.literal("registered"),
      v.literal("updated"),
      v.literal("decommissioned"),
      v.literal("assigned"),
      v.literal("unassigned"),
    ),
    performedBy: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLogs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});
