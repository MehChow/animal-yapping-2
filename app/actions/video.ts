"use server";

import { requireRole } from "@/lib/auth-utils";
import { PrismaClient } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { deleteThumbnail } from "./r2-upload";

const prisma = new PrismaClient();

type UploadVideoInput = {
  streamUid: string; // Stream video ID
  gameType: string;
  videoType: "Normal" | "Shorts";
  title: string;
  description?: string;
  tags: string[];
  duration?: number; // Video duration
  // Thumbnail fields
  thumbnailSource: "stream" | "custom";
  thumbnailTimestamp?: number; // Timestamp in seconds (for stream source)
  customThumbnailKey?: string; // R2 object key (for custom source)
};

export const uploadVideo = async (input: UploadVideoInput) => {
  try {
    // Verify admin role
    const user = await requireRole(["Admin"]);

    const {
      streamUid,
      gameType,
      videoType,
      title,
      description,
      tags,
      duration,
      thumbnailSource,
      thumbnailTimestamp,
      customThumbnailKey,
    } = input;

    // Validate required fields
    if (!streamUid) {
      return {
        success: false,
        error: "Missing Stream video ID",
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
        streamUid,
        duration: duration || null,
        status: "ready",
        uploadedById: user.id,
        // Thumbnail fields
        thumbnailSource: thumbnailSource || "stream",
        thumbnailTimestamp: thumbnailTimestamp ?? null,
        customThumbnailKey: customThumbnailKey || null,
      },
    });

    // Revalidate pages
    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      videoId: video.id,
      message: "Video published successfully!",
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload video",
    };
  }
};

type DeleteVideoInput = {
  videoId: string;
};

export const deleteVideo = async (input: DeleteVideoInput) => {
  try {
    // Verify admin role
    await requireRole(["Admin"]);

    const { videoId } = input;

    // Validate required fields
    if (!videoId) {
      return {
        success: false,
        error: "Missing video ID",
      };
    }

    // Fetch video from database
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        streamUid: true,
        thumbnailSource: true,
        customThumbnailKey: true,
      },
    });

    if (!video) {
      return {
        success: false,
        error: "Video not found",
      };
    }

    // Delete from Cloudflare Stream if streamUid exists
    if (video.streamUid) {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = process.env.CLOUDFLARE_STREAM_TOKEN;

      if (accountId && apiToken) {
        try {
          const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${video.streamUid}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${apiToken}`,
              },
            }
          );

          if (!response.ok) {
            console.error(
              "Failed to delete video from Cloudflare Stream:",
              await response.text()
            );
            // Continue with database deletion even if Stream deletion fails
          }
        } catch (streamError) {
          console.error("Error deleting from Cloudflare Stream:", streamError);
          // Continue with database deletion even if Stream deletion fails
        }
      }
    }

    // Delete custom thumbnail from R2 if it exists
    if (video.thumbnailSource === "custom" && video.customThumbnailKey) {
      try {
        const thumbnailResult = await deleteThumbnail({
          objectKey: video.customThumbnailKey,
        });

        if (!thumbnailResult.success) {
          console.error(
            "Failed to delete thumbnail from R2:",
            thumbnailResult.error
          );
          // Continue with database deletion even if thumbnail deletion fails
        }
      } catch (thumbnailError) {
        console.error("Error deleting thumbnail from R2:", thumbnailError);
        // Continue with database deletion even if thumbnail deletion fails
      }
    }

    // Delete from database
    await prisma.video.delete({
      where: { id: videoId },
    });

    // Revalidate pages
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/manage-video");

    return {
      success: true,
      message: "Video deleted successfully!",
    };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete video",
    };
  }
};
