import { z } from "zod";

export type KlingV21FormKey =
  | "klingV21Type"
  | "klingV21Version"
  | "klingV21Image"
  | "klingV21Prompt"
  | "klingV21NegativePrompt"
  | "klingV21Cfg"
  | "klingV21AspectRatio"
  | "klingV21Duration";

export const KlingV21Schema = z.object({
  klingV21Type: z.string().optional(),
  klingV21Version: z.string().optional(),
  klingV21Image: z.string().or(z.null()).optional(),
  klingV21Prompt: z.string().optional(),
  klingV21NegativePrompt: z.string().optional(),
  klingV21Cfg: z.number().optional(),
  klingV21AspectRatio: z.string().optional(),
  klingV21Duration: z.string().optional(),
});
