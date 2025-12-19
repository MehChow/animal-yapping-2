import { PrismaClient } from "@/app/generated/prisma/client";
import { DEFAULT_VIDEO_SORT, VideoSortValue } from "@/types/video-sort";
import { VideoType } from "@/utils/video-utils";

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

export const getVideoById = async (videoId: string) => {
  try {
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

    return {
      success: true,
      video: {
        ...video,
        createdAt: video.createdAt.toISOString(),
        updatedAt: video.updatedAt.toISOString(),
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

type VideoOrderBy =
  | { createdAt: "asc" | "desc" }
  | { viewCount: "desc" }
  | { likes: { _count: "desc" } };

const resolveVideoOrderBy = (sort: VideoSortValue): VideoOrderBy => {
  switch (sort) {
    case "earliest":
      return { createdAt: "asc" };
    case "liked":
      return { likes: { _count: "desc" } };
    case "viewed":
      return { viewCount: "desc" };
    case "latest":
    default:
      return { createdAt: "desc" };
  }
};

export const getVideos = async (
  limit: number = 10,
  type: VideoType = "Normal",
  sort: VideoSortValue = DEFAULT_VIDEO_SORT
) => {
  try {
    const videos = await prisma.video.findMany({
      where: {
        videoType: type,
        streamUid: { not: null },
      },
      take: limit,
      orderBy: resolveVideoOrderBy(sort),
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

/**
 * Search videos by multiple fields (title, description, tags, uploader name)
 * Uses case-insensitive partial matching with cursor-based pagination
 * @param query Search query string
 * @param limit Maximum number of results to return
 * @param cursor Optional cursor for pagination (video ID)
 * @returns Search results with videos matching the query
 */
export const searchVideos = async (
  query: string,
  limit: number = 10,
  cursor?: string
) => {
  try {
    if (!query.trim()) {
      return { success: true, videos: [], query: "", nextCursor: undefined };
    }

    const videos = await prisma.video.findMany({
      where: {
        streamUid: { not: null },
        OR: [
          // Search by title
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          // Search by description
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          // Search by tags (array contains)
          {
            tags: {
              hasSome: [query.toLowerCase()],
            },
          },
          // Search by uploader name
          {
            uploadedBy: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      take: limit + 1, // Fetch one extra to determine if there are more results
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor itself
      }),
      orderBy: [
        { viewCount: "desc" }, // Prioritize popular videos
        { createdAt: "desc" }, // Then by recency
      ],
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

    // Determine if there are more results
    const hasMore = videos.length > limit;
    const resultVideos = hasMore ? videos.slice(0, limit) : videos;
    const nextCursor = hasMore ? resultVideos[resultVideos.length - 1]?.id : undefined;

    return {
      success: true,
      videos: resultVideos.map((video) => ({
        ...video,
        createdAt: video.createdAt.toISOString(),
        updatedAt: video.updatedAt.toISOString(),
      })),
      query,
      nextCursor,
    };
  } catch (error) {
    console.error("Error searching videos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search videos",
      videos: [],
      query,
      nextCursor: undefined,
    };
  }
};