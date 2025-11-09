-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROVIDER', 'PARTNER', 'USER');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('TRADITIONAL', 'DPC_CATASTROPHIC', 'HIGH_DEDUCTIBLE', 'PPO', 'HMO', 'EPO');

-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('GOODRX', 'COSTCO', 'WALMART', 'CVS', 'WALGREENS', 'MANUFACTURER', 'MANUAL');

-- CreateEnum
CREATE TYPE "LabProvider" AS ENUM ('LABCORP', 'QUEST', 'ANYLABTESTNOW', 'HEALTH_GORILLA', 'DPC_AFFILIATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('GENERIC_DISCOUNT', 'MEMBERSHIP_DISCOUNT', 'MANUFACTURER_COUPON', 'PATIENT_ASSISTANCE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "zipCode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "currentInsuranceType" TEXT,
    "currentPremium" DOUBLE PRECISION,
    "currentDeductible" DOUBLE PRECISION,
    "currentOutOfPocket" DOUBLE PRECISION,
    "chronicConditions" TEXT[],
    "annualDoctorVisits" INTEGER NOT NULL DEFAULT 4,
    "prescriptionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_comparisons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "chronicConditions" TEXT[],
    "annualDoctorVisits" INTEGER NOT NULL,
    "prescriptionCount" INTEGER NOT NULL,
    "traditionalPremium" DOUBLE PRECISION NOT NULL,
    "traditionalDeductible" DOUBLE PRECISION NOT NULL,
    "traditionalOutOfPocket" DOUBLE PRECISION NOT NULL,
    "traditionalTotalAnnual" DOUBLE PRECISION NOT NULL,
    "dpcMonthlyFee" DOUBLE PRECISION NOT NULL,
    "dpcAnnualFee" DOUBLE PRECISION NOT NULL,
    "catastrophicPremium" DOUBLE PRECISION NOT NULL,
    "catastrophicDeductible" DOUBLE PRECISION NOT NULL,
    "catastrophicOutOfPocket" DOUBLE PRECISION NOT NULL,
    "dpcTotalAnnual" DOUBLE PRECISION NOT NULL,
    "annualSavings" DOUBLE PRECISION NOT NULL,
    "percentageSavings" DOUBLE PRECISION NOT NULL,
    "recommendedPlan" "PlanType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dpc_providers" (
    "id" TEXT NOT NULL,
    "npi" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "practiceName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "monthlyFee" DOUBLE PRECISION NOT NULL,
    "familyFee" DOUBLE PRECISION,
    "acceptingPatients" BOOLEAN NOT NULL DEFAULT true,
    "servicesIncluded" TEXT[],
    "specialties" TEXT[],
    "boardCertifications" TEXT[],
    "languages" TEXT[],
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "ribbonHealthId" TEXT,
    "turquoiseHealthId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dpc_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matched_providers" (
    "id" TEXT NOT NULL,
    "comparisonId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "distanceMiles" DOUBLE PRECISION NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matched_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_plans" (
    "id" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL,
    "planName" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "availableZipCodes" TEXT[],
    "monthlyPremium" DOUBLE PRECISION NOT NULL,
    "annualDeductible" DOUBLE PRECISION NOT NULL,
    "maxOutOfPocket" DOUBLE PRECISION NOT NULL,
    "primaryCareVisits" INTEGER,
    "specialistVisits" INTEGER,
    "prescriptionTier1" DOUBLE PRECISION,
    "prescriptionTier2" DOUBLE PRECISION,
    "prescriptionTier3" DOUBLE PRECISION,
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_prices" (
    "id" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "genericName" TEXT,
    "dosage" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "zipCode" TEXT NOT NULL,
    "pharmacyName" TEXT NOT NULL,
    "pharmacyAddress" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "memberPrice" DOUBLE PRECISION,
    "couponPrice" DOUBLE PRECISION,
    "couponUrl" TEXT,
    "source" "PriceSource" NOT NULL,
    "sourceId" TEXT,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescription_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_test_prices" (
    "id" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "cptCode" TEXT,
    "loincCode" TEXT,
    "category" TEXT,
    "retailPrice" DOUBLE PRECISION,
    "cashPrice" DOUBLE PRECISION NOT NULL,
    "dpcPrice" DOUBLE PRECISION,
    "insuranceEstimate" DOUBLE PRECISION,
    "labProvider" "LabProvider" NOT NULL,
    "labLocation" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lab_test_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_savings_programs" (
    "id" TEXT NOT NULL,
    "programName" TEXT NOT NULL,
    "pharmacyChain" TEXT NOT NULL,
    "programType" "ProgramType" NOT NULL,
    "requiresMembership" BOOLEAN NOT NULL DEFAULT false,
    "membershipCost" DOUBLE PRECISION,
    "membershipUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastVerified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pharmacy_savings_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_savings_medications" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "genericName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "price30Day" DOUBLE PRECISION,
    "price60Day" DOUBLE PRECISION,
    "price90Day" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_savings_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dpc_provider_sources" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "lastScraped" TIMESTAMP(3),
    "lastVerified" TIMESTAMP(3),
    "dataQualityScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dpc_provider_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_medications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "currentCost" DOUBLE PRECISION,
    "lowestCashPrice" DOUBLE PRECISION,
    "insurancePrice" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_comparisons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comparisonData" JSONB NOT NULL,
    "name" TEXT,
    "notes" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "sharedPublicly" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "cost_comparisons_userId_idx" ON "cost_comparisons"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dpc_providers_npi_key" ON "dpc_providers"("npi");

-- CreateIndex
CREATE INDEX "dpc_providers_zipCode_idx" ON "dpc_providers"("zipCode");

-- CreateIndex
CREATE INDEX "dpc_providers_state_idx" ON "dpc_providers"("state");

-- CreateIndex
CREATE INDEX "matched_providers_comparisonId_idx" ON "matched_providers"("comparisonId");

-- CreateIndex
CREATE INDEX "insurance_plans_state_idx" ON "insurance_plans"("state");

-- CreateIndex
CREATE INDEX "insurance_plans_planType_idx" ON "insurance_plans"("planType");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "prescription_prices_drugName_zipCode_idx" ON "prescription_prices"("drugName", "zipCode");

-- CreateIndex
CREATE INDEX "prescription_prices_expiresAt_idx" ON "prescription_prices"("expiresAt");

-- CreateIndex
CREATE INDEX "lab_test_prices_testName_idx" ON "lab_test_prices"("testName");

-- CreateIndex
CREATE INDEX "lab_test_prices_cptCode_idx" ON "lab_test_prices"("cptCode");

-- CreateIndex
CREATE INDEX "pharmacy_savings_medications_programId_idx" ON "pharmacy_savings_medications"("programId");

-- CreateIndex
CREATE INDEX "pharmacy_savings_medications_drugName_idx" ON "pharmacy_savings_medications"("drugName");

-- CreateIndex
CREATE UNIQUE INDEX "dpc_provider_sources_providerId_key" ON "dpc_provider_sources"("providerId");

-- CreateIndex
CREATE INDEX "user_medications_userId_idx" ON "user_medications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_comparisons_shareToken_key" ON "saved_comparisons"("shareToken");

-- CreateIndex
CREATE INDEX "saved_comparisons_userId_idx" ON "saved_comparisons"("userId");

-- CreateIndex
CREATE INDEX "saved_comparisons_shareToken_idx" ON "saved_comparisons"("shareToken");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_comparisons" ADD CONSTRAINT "cost_comparisons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matched_providers" ADD CONSTRAINT "matched_providers_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "cost_comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matched_providers" ADD CONSTRAINT "matched_providers_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "dpc_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_savings_medications" ADD CONSTRAINT "pharmacy_savings_medications_programId_fkey" FOREIGN KEY ("programId") REFERENCES "pharmacy_savings_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dpc_provider_sources" ADD CONSTRAINT "dpc_provider_sources_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "dpc_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_medications" ADD CONSTRAINT "user_medications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_comparisons" ADD CONSTRAINT "saved_comparisons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
