"use server";

import { requireRole } from "@/lib/auth-utils";
import { PrismaClient } from "@/app/generated/prisma/client";
import {
  generateThumbnails,
  getVideoDuration,
  generateRandomTimestamps,
} from "@/lib/ffmpeg-utils";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

type UploadVideoInput = {
  videoUrl: string;
  thumbnailUrl: string;
  gameType: string;
  videoType: "Normal" | "Shorts";
  title: string;
  description?: string;
  tags: string[];
};

export const uploadVideo = async (input: UploadVideoInput) => {
  try {
    // Verify admin role
    const user = await requireRole(["Admin"]);

    const { videoUrl, thumbnailUrl, gameType, videoType, title, description, tags } =
      input;

    // Validate required fields
    if (!videoUrl || !thumbnailUrl) {
      return {
        success: false,
        error: "Missing video or thumbnail URL",
      };
    }

    // Save to database
    const video = await prisma.video.create({
      data: {
        title,
        description: description || null,
        gameType,
        videoType,
        tags,
        videoUrl,
        thumbnailUrl,
        uploadedById: user.id,
      },
    });

    // Revalidate pages
    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      videoId: video.id,
      message: "Video uploaded successfully!",
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload video",
    };
  }
};

type GenerateThumbnailsInput = {
  videoUrl: string;
  videoType?: "Normal" | "Shorts";
  regenerate?: boolean;
};

export const generateVideoThumbnails = async (
  input: GenerateThumbnailsInput
) => {
  try {
    // Verify admin role
    await requireRole(["Admin"]);

    const { videoUrl, videoType = "Normal" } = input;

    // Download video from R2 URL
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      return {
        success: false,
        error: "Failed to download video from storage",
      };
    }

    // Convert to buffer
    const arrayBuffer = await videoResponse.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    // Get video duration
    const duration = await getVideoDuration(videoBuffer);

    if (duration < 3) {
      return {
        success: false,
        error: "Video is too short to generate thumbnails",
      };
    }

    // Generate more thumbnails for Shorts (5) than Normal (3)
    const thumbnailCount = videoType === "Shorts" ? 5 : 3;
    const timestamps = generateRandomTimestamps(duration, thumbnailCount);

    // Determine aspect ratio based on video type
    const aspectRatio = videoType === "Shorts" ? "9:16" : "16:9";

    // Generate thumbnails at those timestamps
    const thumbnailBuffers = await generateThumbnails({
      videoBuffer,
      timestamps,
      aspectRatio,
    });

    // Convert buffers to base64 for client display
    const thumbnails = thumbnailBuffers.map((buffer, index) => ({
      id: `${Date.now()}-${index}`,
      data: `data:image/jpeg;base64,${buffer.toString("base64")}`,
      timestamp: timestamps[index],
    }));

    return {
      success: true,
      thumbnails,
    };
  } catch (error) {
    console.error("Thumbnail generation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate thumbnails",
    };
  }
};
