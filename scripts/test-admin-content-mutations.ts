/**
 * Temporary content mutation probe — cleans up after itself.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db/client";
import { ContentStatus } from "../src/generated/prisma";

async function main() {
  const slug = `phase5-probe-${Date.now()}`;
  const project = await prisma.project.create({
    data: {
      slug,
      title: "Phase5 Probe",
      summary: "Temporary probe project",
      status: ContentStatus.DRAFT,
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      coverImageAlt: "probe",
    },
  });
  console.log("OK  draft project created");

  const service = await prisma.service.findFirst({
    where: { deletedAt: null, isActive: true },
  });
  if (service) {
    await prisma.projectService.create({
      data: { projectId: project.id, serviceId: service.id },
    });
    console.log("OK  service relation added");
  }

  // Incomplete publish should remain draft (publication guards are query-side).
  const publicCountBefore = await prisma.project.count({
    where: {
      status: ContentStatus.PUBLISHED,
      deletedAt: null,
      slug,
      publishedAt: { lte: new Date() },
      AND: [{ coverImageUrl: { not: null } }, { summary: { not: "" } }],
    },
  });
  if (publicCountBefore !== 0) {
    throw new Error("Draft unexpectedly public");
  }
  console.log("OK  draft not public");

  await prisma.project.update({
    where: { id: project.id },
    data: {
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });
  console.log("OK  published");

  await prisma.project.update({
    where: { id: project.id },
    data: {
      status: ContentStatus.ARCHIVED,
      deletedAt: new Date(),
    },
  });
  console.log("OK  archived");

  await prisma.projectService.deleteMany({ where: { projectId: project.id } });
  await prisma.project.delete({ where: { id: project.id } });
  console.log("OK  cleaned up");
  console.log("admin:test-content passed");
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
