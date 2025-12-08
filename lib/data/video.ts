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

export const getTrendingVideos = async (limit: number = 10) => {
  try {
    const trendingVideos = await prisma.video.findMany({
      where: {
        videoType: "Normal",
      },
      take: limit,
      orderBy: {
        viewCount: "desc",
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return {
      success: true,
      trendingVideos: trendingVideos.map((video) => ({
        ...video,
        createdAt: video.createdAt.toISOString(),
        updatedAt: video.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch trending videos",
      trendingVideos: [],
    };
  }
};

export const getVideos = async (limit: number = 10) => {
  try {
    const videos = await prisma.video.findMany({
      where: {
        videoType: "Normal",
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
      },
    });

    if (!videos) {
      return { success: false, error: "No videos found" };
    }

    return {
      success: true,
      videos: videos.map((video) => ({
        ...video,
        createdAt: video.createdAt.toISOString(),
        updatedAt: video.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching videos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch videos",
      videos: [],
    };
  }
};
