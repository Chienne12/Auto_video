import { z } from "zod";

export type HiggsfieldFormKey =
  | "higgsfieldMix"
  | "higgsfieldMotion1"
  | "higgsfieldMotion2"
  | "higgsfieldMotionStrength1"
  | "higgsfieldMotionStrength2"
  | "higgsfieldStartFrame"
  | "higgsfieldEndFrame"
  | "higgsfieldPrompt"
  | "higgsfieldModel"
  | "higgsfieldTime";

export const HiggsfieldSchema = z.object({
  higgsfieldMix: z.boolean().optional(),
  higgsfieldMotion1: z.string().optional(),
  higgsfieldMotion2: z.string().optional(),
  higgsfieldMotionStrength1: z.number().optional(),
  higgsfieldMotionStrength2: z.number().optional(),
  higgsfieldStartFrame: z.string().or(z.null()).optional(),
  higgsfieldEndFrame: z.string().or(z.null()).optional(),
  higgsfieldPrompt: z.string().optional(),
  higgsfieldModel: z.string().optional(),
  higgsfieldTime: z.string().optional(),
});
