import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function listTrustMetricsForAdmin() {
  return prisma.trustMetric.findMany({
    orderBy: { displayOrder: "asc" },
  });
}

export async function findTrustMetricByKeyForAdmin(key: string) {
  return prisma.trustMetric.findUnique({
    where: { key },
    select: { id: true },
  });
}

export type TrustMetricWriteInput = {
  key: string;
  label: string;
  value: string;
  prefix: string | null;
  suffix: string | null;
  isVerified: boolean;
  isActive: boolean;
  displayOrder: number;
};

export async function createTrustMetricRow(input: TrustMetricWriteInput) {
  return prisma.trustMetric.create({ data: input, select: { id: true } });
}

export async function updateTrustMetricRow(
  id: string,
  input: TrustMetricWriteInput
) {
  return prisma.trustMetric.update({
    where: { id },
    data: input,
    select: { id: true },
  });
}

export async function deleteTrustMetricRow(id: string) {
  return prisma.trustMetric.delete({ where: { id }, select: { id: true } });
}

export async function listClientLogosForAdmin() {
  return prisma.clientLogo.findMany({ orderBy: { displayOrder: "asc" } });
}

export type ClientLogoWriteInput = {
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  isActive: boolean;
  displayOrder: number;
};

export async function createClientLogoRow(input: ClientLogoWriteInput) {
  return prisma.clientLogo.create({ data: input, select: { id: true } });
}

export async function updateClientLogoRow(
  id: string,
  input: ClientLogoWriteInput
) {
  return prisma.clientLogo.update({
    where: { id },
    data: input,
    select: { id: true },
  });
}

export async function deleteClientLogoRow(id: string) {
  return prisma.clientLogo.delete({ where: { id }, select: { id: true } });
}
