import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma";
import { configureNeonWebSocket } from "./neon-ws";

configureNeonWebSocket();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function readDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required. Set it in .env.local (see .env.example)."
    );
  }
  if (
    !databaseUrl.startsWith("postgresql://") &&
    !databaseUrl.startsWith("postgres://")
  ) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection string.");
  }
  if (!/sslmode=require/i.test(databaseUrl)) {
    throw new Error("DATABASE_URL must include sslmode=require.");
  }
  return databaseUrl;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString: readDatabaseUrl() });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Shared Prisma singleton (Neon adapter).
 * App code should prefer `@/lib/db/prisma` which adds the server-only boundary.
 * Scripts may import this module directly.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
