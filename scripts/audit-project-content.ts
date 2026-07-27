/**
 * Development-only read-only audit of project content readiness against Neon.
 * Never mutates data. Never prints secrets.
 * Exit 0 when the script runs successfully (content gaps are reported, not fatal).
 * Exit non-zero only for technical failures.
 */
import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { ContentStatus, PrismaClient } from "../src/generated/prisma";
import { configureNeonWebSocket } from "../src/lib/db/neon-ws";
import { existsSync } from "node:fs";
import path from "node:path";

config({ path: ".env.local" });
config();
configureNeonWebSocket();

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: databaseUrl }),
  });
}

function isLocalPath(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("/") && !url.startsWith("//"));
}

function localPathExists(url: string): boolean {
  const relative = url.replace(/^\//, "");
  return existsSync(path.join(process.cwd(), "public", relative));
}

async function main() {
  const prisma = createClient();
  const now = new Date();

  try {
    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        featured: true,
        summary: true,
        challenge: true,
        solution: true,
        coverImageUrl: true,
        coverImageAlt: true,
        publishedAt: true,
        media: { select: { id: true, url: true, type: true } },
        projectServices: { select: { serviceId: true } },
      },
    });

    const published = projects.filter(
      p =>
        p.status === ContentStatus.PUBLISHED &&
        p.publishedAt &&
        p.publishedAt <= now &&
        p.summary?.trim() &&
        p.coverImageUrl?.trim() &&
        p.coverImageAlt?.trim()
    );
    const drafts = projects.filter(p => p.status === ContentStatus.DRAFT);
    const missingCovers = projects.filter(
      p => !p.coverImageUrl?.trim() || !p.coverImageAlt?.trim()
    );
    const missingSummaries = projects.filter(p => !p.summary?.trim());
    const missingChallengeOrSolution = projects.filter(
      p => !p.challenge?.trim() || !p.solution?.trim()
    );
    const withoutMedia = projects.filter(p => p.media.length === 0);
    const withoutServices = projects.filter(
      p => p.projectServices.length === 0
    );

    const inaccessibleLocalMedia: string[] = [];
    for (const project of projects) {
      if (isLocalPath(project.coverImageUrl) && project.coverImageUrl) {
        if (!localPathExists(project.coverImageUrl)) {
          inaccessibleLocalMedia.push(
            `${project.slug} cover → ${project.coverImageUrl}`
          );
        }
      }
      for (const media of project.media) {
        if (isLocalPath(media.url) && !localPathExists(media.url)) {
          inaccessibleLocalMedia.push(`${project.slug} media → ${media.url}`);
        }
      }
    }

    console.log("Project content readiness audit (read-only):");
    console.log(`- Total non-deleted projects: ${projects.length}`);
    console.log(`- Public-ready published: ${published.length}`);
    console.log(`- Draft: ${drafts.length}`);
    console.log(`- Missing covers/alt: ${missingCovers.length}`);
    console.log(`- Missing summaries: ${missingSummaries.length}`);
    console.log(
      `- Missing challenge or solution: ${missingChallengeOrSolution.length}`
    );
    console.log(`- Without gallery media: ${withoutMedia.length}`);
    console.log(`- Without service links: ${withoutServices.length}`);
    console.log(
      `- Inaccessible local media paths: ${inaccessibleLocalMedia.length}`
    );

    if (published.length === 0) {
      console.log(
        "- Note: No public-ready projects yet. Work Wall empty state is expected."
      );
    } else {
      console.log("- Published slugs:");
      for (const project of published) {
        console.log(
          `  · ${project.slug}${project.featured ? " (featured)" : ""}`
        );
      }
    }

    if (inaccessibleLocalMedia.length > 0) {
      console.log("- Inaccessible paths:");
      for (const entry of inaccessibleLocalMedia.slice(0, 20)) {
        console.log(`  · ${entry}`);
      }
    }

    console.log("Audit complete (content gaps are informational).");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown project audit error";
    const safeMessage = message
      .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://***")
      .replace(/postgres:\/\/[^\s"']+/gi, "postgres://***")
      .replace(/:[^:@/\s]+@/g, ":***@");
    console.error("Project content audit failed:", safeMessage);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
