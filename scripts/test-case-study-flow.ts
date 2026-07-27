/**
 * Isolated Phase 3 case-study integration test against Neon.
 * Creates a temporary published project, verifies public filters, then deletes only its rows.
 * Does not import server-only modules.
 */
import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import { PrismaNeon } from "@prisma/adapter-neon";
import {
  ContentStatus,
  Prisma,
  PrismaClient,
  ProjectMediaType,
} from "../src/generated/prisma";
import { configureNeonWebSocket } from "../src/lib/db/neon-ws";

config({ path: ".env.local" });
config();
configureNeonWebSocket();

const MARKER = `phase3_case_test_${Date.now()}_${randomUUID().slice(0, 8)}`;
const SLUG = `tmp-case-study-${MARKER.slice(-12)}`.toLowerCase();

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: databaseUrl }),
  });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function publishedWhere(now: Date): Prisma.ProjectWhereInput {
  return {
    deletedAt: null,
    status: ContentStatus.PUBLISHED,
    publishedAt: { not: null, lte: now },
    AND: [
      { slug: { not: "" } },
      { title: { not: "" } },
      { summary: { not: "" } },
      { coverImageUrl: { not: null } },
      { coverImageUrl: { not: "" } },
      { coverImageAlt: { not: null } },
      { coverImageAlt: { not: "" } },
    ],
  };
}

async function main() {
  const prisma = createClient();
  let projectId: string | undefined;

  try {
    const service = await prisma.service.findFirst({
      where: { deletedAt: null, isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { id: true, slug: true },
    });
    assert(service, "Need at least one active service");

    const now = new Date();
    const project = await prisma.project.create({
      data: {
        slug: SLUG,
        title: `[TEST ONLY] Case Study ${MARKER}`,
        clientName: null,
        industry: "Testing",
        summary:
          "Temporary Phase 3 integration project. Not real client work. Safe to delete.",
        challenge: "Temporary challenge text for integration verification.",
        solution: "Temporary solution text for integration verification.",
        duration: "1 week",
        resultText: null,
        coverImageUrl: "/projects/.gitkeep",
        coverImageAlt: "Temporary test cover placeholder",
        featured: true,
        status: ContentStatus.PUBLISHED,
        displayOrder: 99999,
        publishedAt: now,
        media: {
          create: [
            {
              type: ProjectMediaType.IMAGE,
              url: "/projects/.gitkeep",
              altText: "Temporary gallery item",
              displayOrder: 0,
            },
          ],
        },
        projectServices: {
          create: [{ serviceId: service.id }],
        },
      },
      select: { id: true, slug: true },
    });
    projectId = project.id;

    const featured = await prisma.project.findMany({
      where: { ...publishedWhere(now), featured: true, slug: SLUG },
      select: {
        slug: true,
        projectServices: { select: { serviceId: true } },
        media: { select: { id: true }, take: 1 },
      },
    });
    assert(
      featured.length === 1,
      "Featured published query must include temp project"
    );
    assert(
      featured[0]?.projectServices.some(ps => ps.serviceId === service.id),
      "Service association must load"
    );

    const related = await prisma.project.findMany({
      where: {
        ...publishedWhere(now),
        id: { not: project.id },
        projectServices: { some: { serviceId: service.id } },
      },
      take: 3,
      select: { id: true },
    });
    assert(
      !related.some(row => row.id === project.id),
      "Related projects must exclude current"
    );

    await prisma.project.update({
      where: { id: project.id },
      data: { status: ContentStatus.DRAFT },
    });
    const draftHidden = await prisma.project.findFirst({
      where: { ...publishedWhere(now), slug: SLUG },
      select: { id: true },
    });
    assert(!draftHidden, "Draft project must not be publicly readable");

    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(Date.now() + 86_400_000),
      },
    });
    const futureHidden = await prisma.project.findFirst({
      where: { ...publishedWhere(now), slug: SLUG },
      select: { id: true },
    });
    assert(!futureHidden, "Future publishedAt must not be public");

    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: now,
        coverImageUrl: null,
      },
    });
    const incomplete = await prisma.project.findFirst({
      where: { ...publishedWhere(now), slug: SLUG },
      select: { id: true },
    });
    assert(!incomplete, "Missing cover must fail publication where");

    console.log("Case-study flow test passed.");
    console.log(`- Slug exercised: ${SLUG}`);
    console.log(`- Service linked: ${service.slug}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown case-study test error";
    console.error(
      "Case-study flow test failed:",
      message
        .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://***")
        .replace(/postgres:\/\/[^\s"']+/gi, "postgres://***")
        .replace(/:[^:@/\s]+@/g, ":***@")
    );
    process.exitCode = 1;
  } finally {
    if (projectId) {
      await prisma.projectMedia.deleteMany({ where: { projectId } });
      await prisma.projectService.deleteMany({ where: { projectId } });
      await prisma.project.deleteMany({ where: { id: projectId } });
      console.log("Cleanup: temporary project removed.");
    }
    await prisma.$disconnect();
  }
}

main();
