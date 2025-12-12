import { z } from "zod";

export type SeedanceFormKey =
  | "seedanceType"
  | "seedanceText"
  | "seedanceReslution"
  | "seedanceRatio"
  | "seedanceWm"
  | "seedanceCf"
  | "seedanceModel"
  | "seedanceImage"
  | "seedanceDuration";

export const SeedanceSchema = z.object({
  seedanceType: z.string().optional(),
  seedanceText: z.string().optional(),
  seedanceReslution: z.string().optional(),
  seedanceRatio: z.string().optional(),
  seedanceWm: z.string().optional(),
  seedanceCf: z.string().optional(),
  seedanceModel: z.string().optional(),
  seedanceImage: z.string().or(z.null()).optional(),
  seedanceDuration: z.string().optional(),
});
