/*
  Warnings:

  - You are about to drop the column `muxAssetId` on the `video` table. All the data in the column will be lost.
  - You are about to drop the column `muxPlaybackId` on the `video` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailTime` on the `video` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `video` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "video" DROP COLUMN "muxAssetId",
DROP COLUMN "muxPlaybackId",
DROP COLUMN "thumbnailTime",
DROP COLUMN "thumbnailUrl",
DROP COLUMN "videoUrl";
