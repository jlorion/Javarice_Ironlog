import { z } from "zod";

export const KeyAction = z.enum(["Key Checked Out", "Key Returned"]);

export const KeyAuditLogSchema = z.object({
  _id: z.string().optional(),
  _creationTime: z.number().optional(),
  equipmentId: z.string(),
  action: KeyAction,
  performedBy: z.string(),
  timestamp: z.number(),
  status: z.enum(["Key Out", "Key In"]),
});

export const CheckoutKeyInputSchema = z.object({
  equipmentId: z.string(),
  performedBy: z.string(),
});

export const ReturnKeyInputSchema = z.object({
  equipmentId: z.string(),
  performedBy: z.string(),
});

export const FilterAuditLogInputSchema = z.object({
  equipmentId: z.string().optional(),
  workerName: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type KeyAction = z.infer<typeof KeyAction>;
export type KeyAuditLog = z.infer<typeof KeyAuditLogSchema>;
export type CheckoutKeyInput = z.infer<typeof CheckoutKeyInputSchema>;
export type ReturnKeyInput = z.infer<typeof ReturnKeyInputSchema>;
export type FilterAuditLogInput = z.infer<typeof FilterAuditLogInputSchema>;
