import { z } from "zod";

export type ViduV2FormKey =
  | "viduV2Model"
  | "viduV2Type"
  | "viduV2Prompt"
  | "viduV2Image"
  | "viduV2StartFrame"
  | "viduV2EndFrame"
  | "viduV2ReferenceImage1"
  | "viduV2ReferenceImage2"
  | "viduV2ReferenceImage3"
  | "viduV2Duration"
  | "viduV2Resolution"
  | "viduV2Scene"
  | "viduV2MovementAmplitude"
  | "viduV2AspectRatio"
  | "viduV2Style";

export const ViduV2Schema = z.object({
  viduV2Model: z.string().optional(),
  viduV2Type: z.string().optional(),
  viduV2Prompt: z.string().optional(),
  viduV2Image: z.string().or(z.null()).optional(),
  viduV2StartFrame: z.string().or(z.null()).optional(),
  viduV2EndFrame: z.string().or(z.null()).optional(),
  viduV2ReferenceImage1: z.string().or(z.null()).optional(),
  viduV2ReferenceImage2: z.string().or(z.null()).optional(),
  viduV2ReferenceImage3: z.string().or(z.null()).optional(),
  viduV2Duration: z.string().optional(),
  viduV2Resolution: z.string().optional(),
  viduV2Scene: z.string().optional(),
  viduV2MovementAmplitude: z.string().optional(),
  viduV2AspectRatio: z.string().optional(),
  viduV2Style: z.string().optional(),
});
