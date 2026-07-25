-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "mapLocations" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "showMapSection" BOOLEAN NOT NULL DEFAULT true;