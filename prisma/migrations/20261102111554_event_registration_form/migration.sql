-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "eventRegistrationEventFieldId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "eventRegistrationFormUrl" TEXT NOT NULL DEFAULT '';
