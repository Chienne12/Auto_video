import { z } from "zod";

export type KlingV2FormKey =
  | "klingV2Type"
  | "klingV2Image"
  | "klingV2Prompt"
  | "klingV2NegativePrompt"
  | "klingV2Cfg"
  | "klingV2AspectRatio"
  | "klingV2Duration";

export const KlingV2Schema = z.object({
  klingV2Type: z.string().optional(),
  klingV2Image: z.string().or(z.null()).optional(),
  klingV2Prompt: z.string().optional(),
  klingV2NegativePrompt: z.string().optional(),
  klingV2Cfg: z.number().optional(),
  klingV2AspectRatio: z.string().optional(),
  klingV2Duration: z.string().optional(),
});
