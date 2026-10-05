-- CreateTable
CREATE TABLE "CartridgeFamily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Cartridge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "familyId" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL DEFAULT '',
    "soldIndividually" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Cartridge_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "CartridgeFamily" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CartridgeTrio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "codes" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "familyId" TEXT NOT NULL,
    "productId" TEXT,
    CONSTRAINT "CartridgeTrio_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "CartridgeFamily" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartridgeTrio_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductFaq" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scope" TEXT NOT NULL DEFAULT 'global',
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "AppRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "ios" TEXT NOT NULL DEFAULT '',
    "android" TEXT NOT NULL DEFAULT '',
    "bluetooth" TEXT NOT NULL DEFAULT '',
    "iosUrl" TEXT NOT NULL DEFAULT '',
    "androidUrl" TEXT NOT NULL DEFAULT '',
    "methods" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE UNIQUE INDEX "CartridgeFamily_slug_key" ON "CartridgeFamily"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Cartridge_code_key" ON "Cartridge"("code");

-- CreateIndex
CREATE INDEX "Cartridge_familyId_idx" ON "Cartridge"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "CartridgeTrio_slug_key" ON "CartridgeTrio"("slug");

-- CreateIndex
CREATE INDEX "CartridgeTrio_familyId_idx" ON "CartridgeTrio"("familyId");

-- CreateIndex
CREATE INDEX "CartridgeTrio_productId_idx" ON "CartridgeTrio"("productId");

-- CreateIndex
CREATE INDEX "ProductFaq_scope_idx" ON "ProductFaq"("scope");
