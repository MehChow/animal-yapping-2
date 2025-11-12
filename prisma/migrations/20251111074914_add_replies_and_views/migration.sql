-- DropIndex
DROP INDEX "public"."comment_videoId_idx";

-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "video" ALTER COLUMN "status" SET DEFAULT 'ready',
ALTER COLUMN "thumbnailTime" DROP NOT NULL,
ALTER COLUMN "thumbnailTime" DROP DEFAULT;

-- CreateTable
CREATE TABLE "video_view" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_view_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "video_view_videoId_idx" ON "video_view"("videoId");

-- CreateIndex
CREATE INDEX "video_view_userId_idx" ON "video_view"("userId");

-- CreateIndex
CREATE INDEX "comment_videoId_createdAt_idx" ON "comment"("videoId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "comment_parentId_idx" ON "comment"("parentId");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_view" ADD CONSTRAINT "video_view_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_view" ADD CONSTRAINT "video_view_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
