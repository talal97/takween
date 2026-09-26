-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleAr" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);
