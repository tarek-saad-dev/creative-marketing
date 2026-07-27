/**
 * Creates a single AdminUser. Never seeds default/fake credentials —
 * every field must be supplied explicitly on the command line.
 *
 * Usage:
 *   npm run admin:create -- --name "Saad Fahmy" --email "saad@example.com" --password "StrongPassw0rd!" --role OWNER
 *
 * Flags:
 *   --name       Required. Display name.
 *   --email      Required. Unique, case-insensitive.
 *   --password   Required. Minimum 10 characters.
 *   --role       Optional. One of OWNER | ADMIN | EDITOR | VIEWER (default OWNER
 *                for the very first admin, EDITOR otherwise — see logic below).
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { AdminRole, PrismaClient } from "../src/generated/prisma";
import { configureNeonWebSocket } from "../src/lib/db/neon-ws";

config({ path: ".env.local" });
config();
configureNeonWebSocket();

const VALID_ROLES = Object.values(AdminRole);

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: databaseUrl }),
  });
}

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const value =
        argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "";
      args[key] = value;
      if (value) i += 1;
    }
  }
  return args;
}

function redact(message: string): string {
  return message
    .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://***")
    .replace(/postgres:\/\/[^\s"']+/gi, "postgres://***")
    .replace(/:[^:@/\s]+@/g, ":***@");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const name = args.name?.trim();
  const email = args.email?.trim().toLowerCase();
  const password = args.password;
  const requestedRole = args.role?.trim().toUpperCase();

  const errors: string[] = [];
  if (!name) errors.push("--name is required");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("--email is required and must be a valid email");
  }
  if (!password || password.length < 10) {
    errors.push("--password is required and must be at least 10 characters");
  }
  if (requestedRole && !VALID_ROLES.includes(requestedRole as AdminRole)) {
    errors.push(`--role must be one of: ${VALID_ROLES.join(", ")}`);
  }

  if (errors.length > 0) {
    console.error("Cannot create admin user:");
    for (const message of errors) console.error(`  - ${message}`);
    console.error(
      '\nUsage: npm run admin:create -- --name "Full Name" --email "admin@example.com" --password "StrongPassw0rd!" --role OWNER'
    );
    process.exit(1);
  }

  const prisma = createClient();

  try {
    const existing = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true, deletedAt: true },
    });

    if (existing && !existing.deletedAt) {
      console.error(`An admin user with email "${email}" already exists.`);
      console.error(
        "Manage roles/status from /admin/users in the admin UI instead of creating a duplicate."
      );
      process.exit(1);
    }

    const existingAdminCount = await prisma.adminUser.count({
      where: { deletedAt: null },
    });
    const role: AdminRole =
      (requestedRole as AdminRole) ??
      (existingAdminCount === 0 ? AdminRole.OWNER : AdminRole.EDITOR);

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = existing
      ? await prisma.adminUser.update({
          where: { id: existing.id },
          data: { name, passwordHash, role, isActive: true, deletedAt: null },
          select: { id: true, name: true, email: true, role: true },
        })
      : await prisma.adminUser.create({
          data: { name, email, passwordHash, role },
          select: { id: true, name: true, email: true, role: true },
        });

    console.log("Admin user ready:");
    console.log(`- id:    ${admin.id}`);
    console.log(`- name:  ${admin.name}`);
    console.log(`- email: ${admin.email}`);
    console.log(`- role:  ${admin.role}`);
    console.log(
      "\nSign in at /admin/login with the email and password you provided."
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to create admin user:", redact(message));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
