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
        createdAt: "desc", // Get most recent ones first, then we'll shuffle
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
        latestVideoId: null,
      };
    }

    // Step 2: Identify the latest video (first in the array since we ordered by createdAt desc)
    const latestVideoId = allVideos[0].id;

    // Step 3: Shuffle all videos together (including the latest)
    const shuffledVideos = [...allVideos];
    for (let i = shuffledVideos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledVideos[i], shuffledVideos[j]] = [
        shuffledVideos[j],
        shuffledVideos[i],
      ];
    }

    return {
      success: true,
      shorts: shuffledVideos.map((short) => ({
        ...short,
        createdAt: short.createdAt.toISOString(),
        updatedAt: short.updatedAt.toISOString(),
      })),
      latestVideoId, // Return the ID so frontend knows which one to highlight
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
