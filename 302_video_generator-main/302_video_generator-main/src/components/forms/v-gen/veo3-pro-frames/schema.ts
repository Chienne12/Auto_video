import { z } from "zod";

export type Veo3ProFramesFormKey = "veo3ProFramesPrompt" | "veo3ProFramesImage";

export const Veo3ProFramesSchema = z.object({
  veo3ProFramesPrompt: z.string().optional(),
  veo3ProFramesImage: z.string().or(z.null()).optional(),
});

export type Veo3ProSchemaType = z.infer<typeof Veo3ProFramesSchema>;
