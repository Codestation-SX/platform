-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "billingType" TEXT,
ADD COLUMN     "pixExpirationDate" TIMESTAMP(3),
ADD COLUMN     "pixKey" TEXT,
ADD COLUMN     "pixQrCode" TEXT;
