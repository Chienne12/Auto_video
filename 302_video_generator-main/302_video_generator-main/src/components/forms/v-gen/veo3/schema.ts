import { z } from "zod";

export type Veo3FormKey =
  | "veo3Prompt"
  | "veo3AspectRatio"
  | "veo3EnhancePrompt"
  | "veo3GenerateAudio";

export const Veo3Schema = z.object({
  veo3Prompt: z.string().optional(),
  veo3AspectRatio: z.string().optional(),
  veo3EnhancePrompt: z.boolean().optional(),
  veo3GenerateAudio: z.boolean().optional(),
});
