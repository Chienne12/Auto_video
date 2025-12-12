import { z } from "zod";

export type MinimaxHailuo02FormKey =
  | "minimaxiHailuoPrompt"
  | "minimaxiHailuoPromptOptimizer"
  | "minimaxiHailuoDuration"
  | "minimaxiHailuoResolution"
  | "minimaxiHailuoFirstFrameImage";

export const MinimaxHailuo02Schema = z.object({
  minimaxiHailuoPrompt: z.string().optional(),
  minimaxiHailuoPromptOptimizer: z.boolean().optional(),
  minimaxiHailuoDuration: z.string().optional(),
  minimaxiHailuoResolution: z.string().optional(),
  minimaxiHailuoFirstFrameImage: z.string().or(z.null()).optional(),
});
