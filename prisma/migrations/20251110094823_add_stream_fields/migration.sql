/*
  Warnings:

  - A unique constraint covering the columns `[streamUid]` on the table `video` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "video" ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'processing',
ADD COLUMN     "streamUid" TEXT,
ADD COLUMN     "thumbnailTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "videoUrl" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "video_streamUid_key" ON "video"("streamUid");

-- CreateIndex
CREATE INDEX "video_streamUid_idx" ON "video"("streamUid");

-- CreateIndex
CREATE INDEX "video_status_idx" ON "video"("status");
