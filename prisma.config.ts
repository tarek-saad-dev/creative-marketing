import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });
config();

/**
 * Prisma CLI datasource (migrations / introspect) uses the direct URL.
 * A placeholder keeps `prisma generate` working when credentials are not
 * configured yet; migrate/seed/check still require real Neon URLs.
 */
const directUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: directUrl,
  },
});
