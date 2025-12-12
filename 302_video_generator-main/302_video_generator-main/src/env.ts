import { createEnv } from "@t3-oss/env-nextjs";
import { ZodError, z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]),
  },
  client: {
    NEXT_PUBLIC_API_KEY: z.string().optional(),
    NEXT_PUBLIC_AUTH_API_URL: z.string(),
    NEXT_PUBLIC_FETCH_API_URL: z.string(),
    NEXT_PUBLIC_UPLOAD_API_URL: z.string(),
    NEXT_PUBLIC_SHOW_BRAND: z.string(),
    NEXT_PUBLIC_GLOBAL_WEBSITE_URL: z.string(),
    NEXT_PUBLIC_CHINA_WEBSITE_URL: z.string(),
    NEXT_PUBLIC_DEFAULT_MODEL_NAME: z.string(),
    NEXT_PUBLIC_DEFAULT_REGION: z.string(),
    NEXT_PUBLIC_DEFAULT_LOCALE: z.string(),
    NEXT_PUBLIC_GITHUB_REPO_URL: z.string(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
    NEXT_PUBLIC_FETCH_API_URL: process.env.NEXT_PUBLIC_FETCH_API_URL,
    NEXT_PUBLIC_UPLOAD_API_URL: process.env.NEXT_PUBLIC_UPLOAD_API_URL,
    NEXT_PUBLIC_SHOW_BRAND: process.env.NEXT_PUBLIC_SHOW_BRAND,
    NEXT_PUBLIC_GLOBAL_WEBSITE_URL: process.env.NEXT_PUBLIC_GLOBAL_WEBSITE_URL,
    NEXT_PUBLIC_CHINA_WEBSITE_URL: process.env.NEXT_PUBLIC_CHINA_WEBSITE_URL,
    NEXT_PUBLIC_DEFAULT_MODEL_NAME: process.env.NEXT_PUBLIC_DEFAULT_MODEL_NAME,
    NEXT_PUBLIC_DEFAULT_REGION: process.env.NEXT_PUBLIC_DEFAULT_REGION,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_GITHUB_REPO_URL: process.env.NEXT_PUBLIC_GITHUB_REPO_URL,
  },
  onValidationError: (error: ZodError) => {
    console.error(
      "❌ Invalid environment variables:",
      error.flatten().fieldErrors
    );
    process.exit(1);
  },
  emptyStringAsUndefined: true,
});
