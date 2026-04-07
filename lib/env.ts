import { z } from "zod";

const optionalString = z.string().optional().transform((value) => {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
});

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: optionalString,
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: optionalString,
  AUTH_GOOGLE_SECRET: optionalString,
  NEXTAUTH_URL: optionalString.pipe(z.string().url().optional()),
  DEV_AUTH_BYPASS: z.enum(["true", "false"]).optional(),
  GEMINI_API_KEY: optionalString,
  GEMINI_MODEL: optionalString,
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  DEV_AUTH_BYPASS: process.env.DEV_AUTH_BYPASS,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
});
