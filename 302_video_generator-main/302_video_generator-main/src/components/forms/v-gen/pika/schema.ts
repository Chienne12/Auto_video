import { z } from "zod";

export type PikaFormKey = "pikaImage" | "pikaPrompt" | "pikaNegativePrompt";

export const PikaSchema = z.object({
  pikaImage: z.string().or(z.null()).optional(),
  pikaPrompt: z.string().optional(),
  pikaNegativePrompt: z.string().optional(),
  pikaAffects: z.string().optional(),
});

export type PikaSchemaType = z.infer<typeof PikaSchema>;
