-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "aboutGalleryImages" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "aboutHeroImageUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "showAboutGallerySection" BOOLEAN NOT NULL DEFAULT true;
