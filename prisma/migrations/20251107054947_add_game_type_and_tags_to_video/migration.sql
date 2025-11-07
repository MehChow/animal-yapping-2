/*
  Warnings:

  - Added the required column `gameType` to the `video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "video" ADD COLUMN     "gameType" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "video_gameType_idx" ON "video"("gameType");
