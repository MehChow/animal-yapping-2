"use server";

import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

export const getLatestShorts = async (limit: number = 10) => {
  try {
    // Step 1: Get all shorts videos
    const allVideos = await prisma.video.findMany({
      where: {
        videoType: "Shorts",
        streamUid: { not: null },
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!allVideos.length) {
      return {
        success: true,
        shorts: [],
      };
    }

    return {
      success: true,
      shorts: allVideos.map((short) => ({
        ...short,
        createdAt: short.createdAt.toISOString(),
        updatedAt: short.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching latest shorts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch shorts",
      shorts: [],
    };
  }
};
