import ffmpeg from "fluent-ffmpeg";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";

type ThumbnailOptions = {
  videoBuffer: Buffer;
  timestamps: number[]; // Array of timestamps in seconds
  aspectRatio?: "16:9" | "9:16"; // Default is 16:9
};

export const generateThumbnails = async ({
  videoBuffer,
  timestamps,
  aspectRatio = "16:9",
}: ThumbnailOptions): Promise<Buffer[]> => {
  const tempDir = os.tmpdir();
  const videoFileName = `temp-video-${Date.now()}.mp4`;
  const videoPath = path.join(tempDir, videoFileName);

  // Determine thumbnail size based on aspect ratio
  const thumbnailSize = aspectRatio === "16:9" ? "1280x720" : "720x1280";

  try {
    // Write video buffer to temp file
    await writeFile(videoPath, videoBuffer);

    const thumbnails: Buffer[] = [];

    // Generate thumbnail for each timestamp
    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i];
      const thumbnailPath = path.join(tempDir, `thumb-${Date.now()}-${i}.jpg`);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: [timestamp],
            filename: path.basename(thumbnailPath),
            folder: tempDir,
            size: thumbnailSize,
          })
          .on("end", () => resolve())
          .on("error", (err) => reject(err));
      });

      // Read the generated thumbnail
      const fs = await import("fs/promises");
      const thumbnailBuffer = await fs.readFile(thumbnailPath);
      thumbnails.push(thumbnailBuffer);

      // Clean up thumbnail file
      await unlink(thumbnailPath);
    }

    // Clean up video file
    await unlink(videoPath);

    return thumbnails;
  } catch (error) {
    // Clean up on error
    try {
      await unlink(videoPath);
    } catch {}
    throw error;
  }
};

export const getVideoDuration = async (videoBuffer: Buffer): Promise<number> => {
  const tempDir = os.tmpdir();
  const videoFileName = `temp-video-${Date.now()}.mp4`;
  const videoPath = path.join(tempDir, videoFileName);

  try {
    await writeFile(videoPath, videoBuffer);

    const duration = await new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration || 0);
        }
      });
    });

    await unlink(videoPath);
    return duration;
  } catch (error) {
    try {
      await unlink(videoPath);
    } catch {}
    throw error;
  }
};

export const generateRandomTimestamps = (
  duration: number,
  count: number = 3
): number[] => {
  const timestamps: number[] = [];
  const minTime = Math.min(2, duration * 0.1); // Start after 2s or 10% of video
  const maxTime = duration * 0.9; // End at 90% of video

  for (let i = 0; i < count; i++) {
    const randomTime = minTime + Math.random() * (maxTime - minTime);
    timestamps.push(Math.floor(randomTime));
  }

  return timestamps;
};

