import { z } from "zod";

export const EquipmentStatus = z.enum([
  "Available",
  "Deployed",
  "Under Maintenance",
  "Decommissioned",
]);

export const KeyStatus = z.enum(["Key In", "Key Out"]);

export const EquipmentSchema = z.object({
  _id: z.string().optional(),
  _creationTime: z.number().optional(),
  name: z.string().min(1, "Equipment name is required"),
  type: z.string().min(1, "Equipment type is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  status: EquipmentStatus,
  acquisitionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  keyStatus: KeyStatus.default("Key In"),
  decommissionedAt: z.number().optional(),
});

export const RegisterEquipmentInputSchema = EquipmentSchema.omit({
  _id: true,
  _creationTime: true,
  status: true,
  keyStatus: true,
  decommissionedAt: true,
}).extend({
  status: EquipmentStatus.default("Available"),
});

export const UpdateEquipmentInputSchema = z.object({
  equipmentId: z.string(),
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  serialNumber: z.string().min(1).optional(),
  status: EquipmentStatus.optional(),
  acquisitionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const DecommissionEquipmentInputSchema = z.object({
  equipmentId: z.string(),
});

export const FilterEquipmentInputSchema = z.object({
  status: EquipmentStatus.optional(),
});

export type EquipmentStatus = z.infer<typeof EquipmentStatus>;
export type KeyStatus = z.infer<typeof KeyStatus>;
export type Equipment = z.infer<typeof EquipmentSchema>;
export type RegisterEquipmentInput = z.infer<typeof RegisterEquipmentInputSchema>;
export type UpdateEquipmentInput = z.infer<typeof UpdateEquipmentInputSchema>;
export type DecommissionEquipmentInput = z.infer<typeof DecommissionEquipmentInputSchema>;
export type FilterEquipmentInput = z.infer<typeof FilterEquipmentInputSchema>;
