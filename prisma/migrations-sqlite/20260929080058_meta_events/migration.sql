-- CreateTable
CREATE TABLE "MetaEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "orderId" TEXT,
    "userId" TEXT,
    "status" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL DEFAULT '',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" DATETIME,
    "sentAt" DATETIME,
    "errorMessage" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "eventId" TEXT NOT NULL DEFAULT '',
    "sessionId" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL DEFAULT '',
    "path" TEXT NOT NULL DEFAULT '',
    "contentIds" TEXT NOT NULL DEFAULT '',
    "valueMinor" INTEGER,
    "currency" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "medium" TEXT NOT NULL DEFAULT '',
    "campaign" TEXT NOT NULL DEFAULT '',
    "device" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "subtotalMinor" INTEGER NOT NULL DEFAULT 0,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "shippingMinor" INTEGER NOT NULL DEFAULT 0,
    "taxMinor" INTEGER NOT NULL DEFAULT 0,
    "totalMinor" INTEGER NOT NULL DEFAULT 0,
    "couponCode" TEXT NOT NULL DEFAULT '',
    "addressJson" TEXT NOT NULL DEFAULT '{}',
    "razorpayOrderId" TEXT NOT NULL DEFAULT '',
    "idempotencyKey" TEXT NOT NULL,
    "internalNote" TEXT NOT NULL DEFAULT '',
    "attributionJson" TEXT NOT NULL DEFAULT '{}',
    "landingPage" TEXT NOT NULL DEFAULT '',
    "referrer" TEXT NOT NULL DEFAULT '',
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("addressJson", "couponCode", "createdAt", "currency", "discountMinor", "email", "id", "idempotencyKey", "internalNote", "name", "number", "paymentStatus", "phone", "razorpayOrderId", "shippingMinor", "status", "subtotalMinor", "taxMinor", "totalMinor", "updatedAt", "userId") SELECT "addressJson", "couponCode", "createdAt", "currency", "discountMinor", "email", "id", "idempotencyKey", "internalNote", "name", "number", "paymentStatus", "phone", "razorpayOrderId", "shippingMinor", "status", "subtotalMinor", "taxMinor", "totalMinor", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_email_idx" ON "Order"("email");
CREATE INDEX "Order_razorpayOrderId_idx" ON "Order"("razorpayOrderId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "razorpayOrderId" TEXT NOT NULL DEFAULT '',
    "razorpayPaymentId" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amountMinor", "createdAt", "currency", "id", "orderId", "razorpayOrderId", "razorpayPaymentId", "status") SELECT "amountMinor", "createdAt", "currency", "id", "orderId", "razorpayOrderId", "razorpayPaymentId", "status" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE INDEX "Payment_razorpayOrderId_idx" ON "Payment"("razorpayOrderId");
CREATE INDEX "Payment_razorpayPaymentId_idx" ON "Payment"("razorpayPaymentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MetaEvent_eventId_key" ON "MetaEvent"("eventId");

-- CreateIndex
CREATE INDEX "MetaEvent_status_idx" ON "MetaEvent"("status");

-- CreateIndex
CREATE INDEX "MetaEvent_orderId_idx" ON "MetaEvent"("orderId");

-- CreateIndex
CREATE INDEX "MetaEvent_eventName_idx" ON "MetaEvent"("eventName");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent"("name", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_campaign_idx" ON "AnalyticsEvent"("campaign");
