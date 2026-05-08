import { z } from "zod";

export const ActivityCategory = z.enum(["equipment", "assignment"]);

export const ActivityAction = z.enum([
  "registered",
  "updated",
  "decommissioned",
  "assigned",
  "unassigned",
]);

export const ActivityLogSchema = z.object({
  _id: z.string().optional(),
  _creationTime: z.number().optional(),
  category: ActivityCategory,
  entityType: z.enum(["equipment", "site"]),
  entityId: z.string(),
  action: ActivityAction,
  performedBy: z.string(),
  details: z.string().optional(),
  timestamp: z.number(),
});

export type ActivityCategory = z.infer<typeof ActivityCategory>;
export type ActivityAction = z.infer<typeof ActivityAction>;
export type ActivityLog = z.infer<typeof ActivityLogSchema>;
