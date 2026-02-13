-- AlterTable
ALTER TABLE "HeldOrder" ADD COLUMN     "tableId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "tableId" TEXT;

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Table_number_key" ON "Table"("number");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeldOrder" ADD CONSTRAINT "HeldOrder_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;
