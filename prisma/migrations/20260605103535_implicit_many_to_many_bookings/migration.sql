/*
  Warnings:

  - You are about to drop the column `seatId` on the `Booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_seatId_fkey";

-- DropIndex
DROP INDEX "Booking_showtimeId_seatId_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "seatId";

-- CreateTable
CREATE TABLE "_BookingToSeat" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookingToSeat_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BookingToSeat_B_index" ON "_BookingToSeat"("B");

-- AddForeignKey
ALTER TABLE "_BookingToSeat" ADD CONSTRAINT "_BookingToSeat_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingToSeat" ADD CONSTRAINT "_BookingToSeat_B_fkey" FOREIGN KEY ("B") REFERENCES "Seat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
