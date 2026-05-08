import { z } from "zod";

export const SiteStatus = z.enum(["Active", "Inactive"]);

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const SiteSchema = z.object({
  _id: z.string().optional(),
  _creationTime: z.number().optional(),
  name: z.string().min(1, "Site name is required"),
  location: z.string().min(1, "Location description is required"),
  coordinates: CoordinatesSchema,
  status: SiteStatus,
});

export const CreateSiteInputSchema = SiteSchema.omit({
  _id: true,
  _creationTime: true,
});

export const UpdateSiteInputSchema = z.object({
  siteId: z.string(),
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  coordinates: CoordinatesSchema.optional(),
  status: SiteStatus.optional(),
});

export type SiteStatus = z.infer<typeof SiteStatus>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type CreateSiteInput = z.infer<typeof CreateSiteInputSchema>;
export type UpdateSiteInput = z.infer<typeof UpdateSiteInputSchema>;
