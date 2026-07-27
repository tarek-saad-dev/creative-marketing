-- Phase 5: Admin CMS foundation
-- Fully additive / non-destructive migration:
--   * new enum AdminRole
--   * new tables AdminUser, AdminAuditLog
--   * new nullable/defaulted columns on ProjectMedia, Testimonial, Lead
--   * new FK from Lead -> AdminUser (SET NULL) and AdminAuditLog -> AdminUser (SET NULL)
-- No existing table, column, or row is dropped, renamed, or made non-nullable
-- without a default. Safe to run against a database with existing data.

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_role_idx" ON "AdminUser"("role");

-- CreateIndex
CREATE INDEX "AdminUser_isActive_idx" ON "AdminUser"("isActive");

-- CreateIndex
CREATE INDEX "AdminUser_deletedAt_idx" ON "AdminUser"("deletedAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminUserId_idx" ON "AdminAuditLog"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: ProjectMedia Cloudinary metadata (additive, all nullable)
ALTER TABLE "ProjectMedia" ADD COLUMN "cloudinaryPublicId" TEXT;
ALTER TABLE "ProjectMedia" ADD COLUMN "resourceType" TEXT;
ALTER TABLE "ProjectMedia" ADD COLUMN "format" TEXT;
ALTER TABLE "ProjectMedia" ADD COLUMN "bytes" INTEGER;
ALTER TABLE "ProjectMedia" ADD COLUMN "duration" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "ProjectMedia_cloudinaryPublicId_idx" ON "ProjectMedia"("cloudinaryPublicId");

-- AlterTable: Testimonial publication confirmation (additive, defaulted)
ALTER TABLE "Testimonial" ADD COLUMN "publicApprovalConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Lead CRM fields (additive, all nullable)
ALTER TABLE "Lead" ADD COLUMN "internalNote" TEXT;
ALTER TABLE "Lead" ADD COLUMN "assignedAdminId" TEXT;

-- CreateIndex
CREATE INDEX "Lead_assignedAdminId_idx" ON "Lead"("assignedAdminId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
