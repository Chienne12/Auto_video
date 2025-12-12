import { z } from "zod";

export type MJVideoFormKey = "mjVideoPrompt" | "mjVideoMotion" | "mjVideoImage";

export const MJVideoSchema = z.object({
  mjVideoPrompt: z.string().optional(),
  mjVideoMotion: z.string().optional(),
  mjVideoImage: z.string().or(z.null()).optional(),
});

export type MJVideoSchemaType = z.infer<typeof MJVideoSchema>;
