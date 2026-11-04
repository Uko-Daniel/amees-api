-- AlterTable
ALTER TABLE "CalendarEntry" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "joinUrl" TEXT,
ADD COLUMN     "registrationUrl" TEXT;

-- AlterTable
ALTER TABLE "FeaturedEvent" ADD COLUMN     "joinUrl" TEXT,
ADD COLUMN     "registrationUrl" TEXT;

-- AlterTable
ALTER TABLE "WeeklyRhythm" ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "joinUrl" TEXT,
ADD COLUMN     "registrationUrl" TEXT,
ADD COLUMN     "startTime" TEXT;
