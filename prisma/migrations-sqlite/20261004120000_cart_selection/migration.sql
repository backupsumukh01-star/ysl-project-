-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN "selection" TEXT NOT NULL DEFAULT '';

-- RedefineIndex
DROP INDEX "CartItem_cartId_productId_variantId_key";
CREATE UNIQUE INDEX "CartItem_cartId_productId_variantId_selection_key" ON "CartItem"("cartId", "productId", "variantId", "selection");
