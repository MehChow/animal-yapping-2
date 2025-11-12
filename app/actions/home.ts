"use server";

import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

export const getLatestVideo = async () => {
  try {
    const video = await prisma.video.findFirst({
      where: {
        videoType: "Normal",
        streamUid: { not: null },
      },
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

    if (!video) {
      return { success: false, error: "No videos found" };
    }

    return {
      success: true,
      video: {
        ...video,
        createdAt: video.createdAt.toISOString(),
        updatedAt: video.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error fetching latest video:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch video",
    };
  }
};

export const getLatestShorts = async (limit: number = 10) => {
  try {
    const shorts = await prisma.video.findMany({
      where: {
        videoType: "Shorts",
        streamUid: { not: null },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
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

    return {
      success: true,
      shorts: shorts.map((short) => ({
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
