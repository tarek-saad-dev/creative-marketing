/**
 * Idempotent project import by slug.
 * Defaults to DRAFT. Does not delete projects missing from the manifest.
 * Does not overwrite existing fields unless forceOverwrite is true
 * (except always syncing relations when forceOverwrite, or when creating).
 *
 * Usage:
 *   npx tsx scripts/import-projects.ts --dry-run
 *   npx tsx scripts/import-projects.ts --file content/projects/my-real-manifest.ts
 *
 * Never import the example manifest into Neon as production content.
 */
import { config } from "dotenv";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaNeon } from "@prisma/adapter-neon";
import {
  ContentStatus,
  PrismaClient,
  ProjectMediaType,
} from "../src/generated/prisma";
import { configureNeonWebSocket } from "../src/lib/db/neon-ws";
import { projectImportManifestSchema } from "../content/projects/project-import.schema";
import { projectImportExample } from "../content/projects/project-import.example";

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

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run");
  const allowExample = argv.includes("--allow-example");
  const fileFlag = argv.findIndex(arg => arg === "--file");
  const file = fileFlag >= 0 ? argv[fileFlag + 1] : null;
  return { dryRun, allowExample, file };
}

async function loadManifest(file: string | null, allowExample: boolean) {
  if (!file) {
    if (!allowExample) {
      throw new Error(
        "Refusing to load the example manifest without --allow-example. Pass --file <manifest> for real content."
      );
    }
    return projectImportManifestSchema.parse(projectImportExample);
  }

  const mod = await import(pathToFileUrl(file));
  const candidate = mod.default ?? mod.manifest ?? mod.projectImportManifest;
  return projectImportManifestSchema.parse(candidate);
}

function pathToFileUrl(filePath: string) {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  return pathToFileURL(absolute).href;
}

async function main() {
  const { dryRun, allowExample, file } = parseArgs(process.argv.slice(2));
  const manifest = await loadManifest(file, allowExample);

  if (
    manifest.projects.some(
      p =>
        p.slug.includes("example") ||
        p.title.includes("[EXAMPLE]") ||
        (p.clientName?.includes("PLACEHOLDER") ?? false)
    ) &&
    !allowExample
  ) {
    throw new Error(
      "Manifest looks like placeholder/example content. Pass --allow-example only for local schema drills."
    );
  }

  if (dryRun) {
    console.log(
      `Dry run: ${manifest.projects.length} project(s) would be upserted (forceOverwrite=${manifest.forceOverwrite}).`
    );
    for (const project of manifest.projects) {
      console.log(
        `  · ${project.slug} [${project.status}] services=${project.serviceSlugs.length} media=${project.media.length}`
      );
    }
    return;
  }

  const prisma = createClient();

  try {
    for (const item of manifest.projects) {
      const existing = await prisma.project.findUnique({
        where: { slug: item.slug },
        select: { id: true },
      });

      const status =
        item.status === "PUBLISHED"
          ? ContentStatus.PUBLISHED
          : ContentStatus.DRAFT;

      const services = item.serviceSlugs.length
        ? await prisma.service.findMany({
            where: {
              slug: { in: item.serviceSlugs },
              deletedAt: null,
            },
            select: { id: true, slug: true },
          })
        : [];

      const missingSlugs = item.serviceSlugs.filter(
        slug => !services.some(service => service.slug === slug)
      );
      if (missingSlugs.length > 0) {
        console.warn(
          `Warning: unknown service slugs for ${item.slug}: ${missingSlugs.join(", ")}`
        );
      }

      if (!existing) {
        await prisma.project.create({
          data: {
            slug: item.slug,
            title: item.title,
            clientName: item.clientName ?? null,
            industry: item.industry ?? null,
            summary: item.summary,
            challenge: item.challenge ?? null,
            solution: item.solution ?? null,
            duration: item.duration ?? null,
            resultText: item.resultText ?? null,
            coverImageUrl: item.coverImageUrl ?? null,
            coverImageAlt: item.coverImageAlt ?? null,
            featured: item.featured,
            status,
            displayOrder: item.displayOrder,
            publishedAt:
              status === ContentStatus.PUBLISHED
                ? (item.publishedAt ?? new Date())
                : null,
            media: {
              create: item.media.map(media => ({
                type:
                  media.type === "VIDEO"
                    ? ProjectMediaType.VIDEO
                    : ProjectMediaType.IMAGE,
                url: media.url,
                thumbnailUrl: media.thumbnailUrl ?? null,
                altText: media.altText ?? null,
                caption: media.caption ?? null,
                width: media.width ?? null,
                height: media.height ?? null,
                displayOrder: media.displayOrder,
              })),
            },
            projectServices: {
              create: services.map(service => ({
                serviceId: service.id,
              })),
            },
          },
        });
        console.log(`Created ${item.slug}`);
        continue;
      }

      if (!manifest.forceOverwrite) {
        console.log(
          `Skipped existing ${item.slug} (pass forceOverwrite in manifest to update)`
        );
        continue;
      }

      await prisma.$transaction(async tx => {
        await tx.projectMedia.deleteMany({
          where: { projectId: existing.id },
        });
        await tx.projectService.deleteMany({
          where: { projectId: existing.id },
        });
        await tx.project.update({
          where: { id: existing.id },
          data: {
            title: item.title,
            clientName: item.clientName ?? null,
            industry: item.industry ?? null,
            summary: item.summary,
            challenge: item.challenge ?? null,
            solution: item.solution ?? null,
            duration: item.duration ?? null,
            resultText: item.resultText ?? null,
            coverImageUrl: item.coverImageUrl ?? null,
            coverImageAlt: item.coverImageAlt ?? null,
            featured: item.featured,
            status,
            displayOrder: item.displayOrder,
            publishedAt:
              status === ContentStatus.PUBLISHED
                ? (item.publishedAt ?? new Date())
                : null,
            media: {
              create: item.media.map(media => ({
                type:
                  media.type === "VIDEO"
                    ? ProjectMediaType.VIDEO
                    : ProjectMediaType.IMAGE,
                url: media.url,
                thumbnailUrl: media.thumbnailUrl ?? null,
                altText: media.altText ?? null,
                caption: media.caption ?? null,
                width: media.width ?? null,
                height: media.height ?? null,
                displayOrder: media.displayOrder,
              })),
            },
            projectServices: {
              create: services.map(service => ({
                serviceId: service.id,
              })),
            },
          },
        });
      });
      console.log(`Updated ${item.slug}`);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown import error";
    const safeMessage = message
      .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://***")
      .replace(/postgres:\/\/[^\s"']+/gi, "postgres://***")
      .replace(/:[^:@/\s]+@/g, ":***@");
    console.error("Import failed:", safeMessage);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
