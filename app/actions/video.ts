"use server";

import { requireRole } from "@/lib/auth-utils";
import { PrismaClient } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

type UploadVideoInput = {
  streamUid: string; // Stream video ID
  gameType: string;
  videoType: "Normal" | "Shorts";
  title: string;
  description?: string;
  tags: string[];
  duration?: number; // Video duration
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
