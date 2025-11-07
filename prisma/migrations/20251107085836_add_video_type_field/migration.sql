-- AlterTable
ALTER TABLE "video" ADD COLUMN     "videoType" TEXT NOT NULL DEFAULT 'Normal';

-- CreateIndex
CREATE INDEX "video_videoType_idx" ON "video"("videoType");
