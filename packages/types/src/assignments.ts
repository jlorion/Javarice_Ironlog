import { z } from "zod";

export const EquipmentAssignmentSchema = z.object({
  _id: z.string().optional(),
  _creationTime: z.number().optional(),
  equipmentId: z.string(),
  siteId: z.string(),
  assignedBy: z.string(),
  assignedAt: z.number(),
  unassignedAt: z.number().optional(),
  unassignedBy: z.string().optional(),
  unassignedReason: z.string().optional(),
});

export const AssignEquipmentInputSchema = z.object({
  equipmentId: z.string(),
  siteId: z.string(),
});

export const UnassignEquipmentInputSchema = z.object({
  equipmentId: z.string(),
  reason: z.string().optional(),
});

export const ListEquipmentBySiteInputSchema = z.object({
  siteId: z.string(),
});

export type EquipmentAssignment = z.infer<typeof EquipmentAssignmentSchema>;
export type AssignEquipmentInput = z.infer<typeof AssignEquipmentInputSchema>;
export type UnassignEquipmentInput = z.infer<typeof UnassignEquipmentInputSchema>;
export type ListEquipmentBySiteInput = z.infer<typeof ListEquipmentBySiteInputSchema>;
