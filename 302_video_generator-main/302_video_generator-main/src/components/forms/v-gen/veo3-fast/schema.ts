import { z } from "zod";

export type Veo3FastFormKey = "veo3FastPrompt";

export const Veo3FastSchema = z.object({
  veo3FastPrompt: z.string().optional(),
});

export type Veo3FastSchemaType = z.infer<typeof Veo3FastSchema>;
