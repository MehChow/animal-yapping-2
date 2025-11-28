import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

type GetPostsInput = {
  cursor?: string;
  limit?: number;
  userId?: string; // Optional user ID for like status
};

type PostWithDetails = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  images: {
    id: string;
    imageKey: string;
    order: number;
  }[];
  _count: {
    likes: number;
  };
  isLiked: boolean;
};

type GetPostsResult = {
  success: boolean;
  posts?: PostWithDetails[];
  nextCursor?: string;
  error?: string;
};

/**
 * Get posts with pagination (public access)
 */
export const getPosts = async (
  input: GetPostsInput = {}
): Promise<GetPostsResult> => {
  try {
    const { cursor, limit = 10, userId } = input;

    const posts = await prisma.post.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            imageKey: true,
            order: true,
          },
        },
        _count: {
          select: { likes: true },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
    });

    let nextCursor: string | undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem?.id;
    }

    const postsWithLikeStatus = posts.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      author: post.author,
      images: post.images,
      _count: post._count,
      isLiked: Array.isArray(post.likes) && post.likes.length > 0,
    }));

    return {
      success: true,
      posts: postsWithLikeStatus,
      nextCursor,
    };
  } catch (error) {
    console.error("Error getting posts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get posts",
    };
  }
};
