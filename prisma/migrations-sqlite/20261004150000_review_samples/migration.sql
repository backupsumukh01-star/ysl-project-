-- Sample reviews have no account or order. Existing purchase reviews are copied through.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "reviewerName" TEXT NOT NULL DEFAULT '',
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "comment" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "cartridgeFamily" TEXT NOT NULL DEFAULT '',
    "reviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Review" (
    "id", "productId", "userId", "orderId", "reviewerName", "rating", "title", "comment", "imageUrl", "status",
    "isDemo", "verifiedPurchase", "helpfulCount", "cartridgeFamily", "reviewDate", "createdAt", "updatedAt"
)
SELECT
    "id", "productId", "userId", "orderId", '', "rating", "title", "comment", "imageUrl", "status",
    0, 1, 0, '', "createdAt", "createdAt", CURRENT_TIMESTAMP
FROM "Review";

DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";

CREATE INDEX "Review_productId_status_idx" ON "Review"("productId", "status");
CREATE UNIQUE INDEX "Review_userId_orderId_productId_key" ON "Review"("userId", "orderId", "productId");
CREATE INDEX "Review_productId_isDemo_status_idx" ON "Review"("productId", "isDemo", "status");
CREATE INDEX "Review_productId_reviewDate_idx" ON "Review"("productId", "reviewDate");

CREATE TABLE "ReviewMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "thumbnailUrl" TEXT NOT NULL DEFAULT '',
    "caption" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewMedia_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ReviewMedia_reviewId_status_idx" ON "ReviewMedia"("reviewId", "status");

PRAGMA foreign_keys=ON;
