"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Fetch video with user interaction status
export const getVideoWithInteractions = async (videoId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
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
      return { success: false, error: "Video not found" };
    }

    // Check user interactions
    let isLiked = false;
    let isFavorited = false;

    if (userId) {
      const [like, favorite] = await Promise.all([
        prisma.like.findUnique({
          where: {
            videoId_userId: {
              videoId,
              userId,
            },
          },
        }),
        prisma.favorite.findUnique({
          where: {
            videoId_userId: {
              videoId,
              userId,
            },
          },
        }),
      ]);

      isLiked = !!like;
      isFavorited = !!favorite;
    }

    return {
      success: true,
      video: {
        ...video,
        isLiked,
        isFavorited,
      },
    };
  } catch (error) {
    console.error("Error fetching video:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch video",
    };
  }
};

// Track video view
export const trackVideoView = async (videoId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;

    // Create view record
    await prisma.videoView.create({
      data: {
        videoId,
        userId: userId || null,
      },
    });

    // Increment view count
    await prisma.video.update({
      where: { id: videoId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error tracking view:", error);
    return { success: false };
  }
};

// Toggle video like
export const toggleVideoLike = async (videoId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", requiresAuth: true };
    }

    const userId = session.user.id;

    const existingLike = await prisma.like.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          videoId_userId: {
            videoId,
            userId,
          },
        },
      });

      return { success: true, isLiked: false };
    } else {
      // Like
      await prisma.like.create({
        data: {
          videoId,
          userId,
        },
      });

      return { success: true, isLiked: true };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle like",
    };
  }
};

// Toggle video favorite (bookmark)
export const toggleVideoFavorite = async (videoId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", requiresAuth: true };
    }

    const userId = session.user.id;

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId,
        },
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          videoId_userId: {
            videoId,
            userId,
          },
        },
      });

      return { success: true, isFavorited: false };
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          videoId,
          userId,
        },
      });

      return { success: true, isFavorited: true };
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to toggle favorite",
    };
  }
};

// Get video like count
export const getVideoLikeCount = async (videoId: string) => {
  try {
    const count = await prisma.like.count({
      where: { videoId },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error getting like count:", error);
    return { success: false, count: 0 };
  }
};

