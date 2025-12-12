import { z } from "zod";

export type Veo3ProFormKey = "veo3ProPrompt";

export const Veo3ProSchema = z.object({
  veo3ProPrompt: z.string().optional(),
});

export type Veo3ProSchemaType = z.infer<typeof Veo3ProSchema>;
