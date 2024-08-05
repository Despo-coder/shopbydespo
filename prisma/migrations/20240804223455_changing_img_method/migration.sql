-- CreateIndex
CREATE INDEX "Order_userId_productId_idx" ON "Order"("userId", "productId");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_priceInCents_idx" ON "Product"("priceInCents");

-- CreateIndex
CREATE INDEX "Product_isAvailableForPurchase_idx" ON "Product"("isAvailableForPurchase");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");
