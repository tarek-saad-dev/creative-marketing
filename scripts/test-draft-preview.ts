/**
 * Draft preview repository probe using Prisma only (no server-only imports).
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db/client";

async function main() {
  const marker = `preview-probe-${Date.now()}`;
  const project = await prisma.project.create({
    data: {
      slug: marker,
      title: "Preview Probe",
      industry: "test",
      summary: "temporary preview probe — not for public",
      status: "DRAFT",
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      coverImageAlt: "probe",
      displayOrder: 99999,
    },
  });

  try {
    const published = await prisma.project.findFirst({
      where: {
        slug: marker,
        deletedAt: null,
        status: "PUBLISHED",
        publishedAt: { not: null, lte: new Date() },
      },
    });
    if (published) {
      throw new Error("Draft leaked into published query");
    }
    console.log("OK  draft hidden from public-style query");

    const preview = await prisma.project.findFirst({
      where: { slug: marker, deletedAt: null },
    });
    if (!preview || preview.id !== project.id) {
      throw new Error("Preview-style query failed to load draft");
    }
    console.log("OK  preview-style query loads draft");

    console.log("admin:test-preview passed");
  } finally {
    await prisma.project.delete({ where: { id: project.id } });
  }
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
