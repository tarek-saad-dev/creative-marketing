import "server-only";

import { z } from "zod";

const postgresUrlSchema = z
  .string({ error: "Connection string is required" })
  .min(1, "Connection string is required")
  .refine(
    value =>
      value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "Must be a PostgreSQL connection string"
  )
  .refine(
    value => /sslmode=require/i.test(value),
    "Must include sslmode=require"
  );

const serverEnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: postgresUrlSchema,
    DIRECT_URL: postgresUrlSchema,
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

    // Auth.js (next-auth v5) — required in production, optional in dev/test
    // so the app can boot before an admin operator has configured a secret.
    AUTH_SECRET: z.string().min(1).optional(),
    AUTH_URL: z.string().url().optional(),

    // Cloudinary — optional until an operator wires up admin media uploads.
    // All three must be present together; see refine() below.
    CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  })
  .refine(env => env.NODE_ENV !== "production" || Boolean(env.AUTH_SECRET), {
    message: "AUTH_SECRET is required when NODE_ENV=production",
    path: ["AUTH_SECRET"],
  })
  .refine(
    env => {
      const values = [
        env.CLOUDINARY_CLOUD_NAME,
        env.CLOUDINARY_API_KEY,
        env.CLOUDINARY_API_SECRET,
      ];
      const configuredCount = values.filter(Boolean).length;
      return configuredCount === 0 || configuredCount === values.length;
    },
    {
      message:
        "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must all be set together, or all left unset",
      path: ["CLOUDINARY_CLOUD_NAME"],
    }
  );

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function redactMessage(message: string): string {
  return message
    .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://***")
    .replace(/postgres:\/\/[^\s"']+/gi, "postgres://***")
    .replace(/:[^:@/\s]+@/g, ":***@");
}

/**
 * Validates server-only environment variables.
 * Never logs or returns secret values.
 */
export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map(issue => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(
      redactMessage(
        `Invalid server environment configuration. ${details}. Set DATABASE_URL (pooled Neon) and DIRECT_URL (direct Neon) in .env.local (see .env.example).`
      )
    );
  }

  return parsed.data;
}

/**
 * True when all three Cloudinary variables are configured. Admin media
 * upload UI and signed-upload actions must check this before rendering
 * upload controls or issuing signatures.
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export type CloudinaryEnv = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

/** Throws if Cloudinary is not fully configured. Callers must check first. */
export function getCloudinaryEnv(): CloudinaryEnv {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local."
    );
  }
  return { cloudName, apiKey, apiSecret };
}
