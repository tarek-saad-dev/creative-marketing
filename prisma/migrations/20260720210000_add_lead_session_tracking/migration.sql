-- CreateEnum
CREATE TYPE "LeadSessionEventType" AS ENUM (
  'FORM_OPENED',
  'PACKAGE_SELECTED',
  'STEP_COMPLETED',
  'FORM_SUBMITTED',
  'WHATSAPP_OPENED',
  'FORM_ABANDONED'
);

-- CreateTable
CREATE TABLE "LeadSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "source" TEXT,
    "referrer" TEXT,
    "landingUrl" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "selectedPackageId" TEXT,
    "leadId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadSessionEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "LeadSessionEventType" NOT NULL,
    "step" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadSessionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadSession_sessionToken_key" ON "LeadSession"("sessionToken");

-- CreateIndex
CREATE INDEX "LeadSession_leadId_idx" ON "LeadSession"("leadId");

-- CreateIndex
CREATE INDEX "LeadSession_selectedPackageId_idx" ON "LeadSession"("selectedPackageId");

-- CreateIndex
CREATE INDEX "LeadSession_lastActivityAt_idx" ON "LeadSession"("lastActivityAt");

-- CreateIndex
CREATE INDEX "LeadSession_startedAt_idx" ON "LeadSession"("startedAt");

-- CreateIndex
CREATE INDEX "LeadSessionEvent_sessionId_createdAt_idx" ON "LeadSessionEvent"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadSessionEvent_type_idx" ON "LeadSessionEvent"("type");

-- AddForeignKey
ALTER TABLE "LeadSession" ADD CONSTRAINT "LeadSession_selectedPackageId_fkey" FOREIGN KEY ("selectedPackageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSession" ADD CONSTRAINT "LeadSession_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSessionEvent" ADD CONSTRAINT "LeadSessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LeadSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
