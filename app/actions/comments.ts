"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/app/generated/prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const COMMENTS_PER_PAGE = 20;

// Validation schemas
const AddCommentSchema = z.object({
  videoId: z.string().min(1),
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

// Fetch comments with cursor-based pagination
export const getComments = async (
  videoId: string,
  cursor?: string,
  parentId?: string | null
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;

    const where = {
      videoId,
      parentId: parentId === undefined ? null : parentId, // Top-level comments or replies
    };

    const comments = await prisma.comment.findMany({
      where,
      take: COMMENTS_PER_PAGE + 1, // Fetch one extra to check if there's more
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        likes: userId
          ? {
              where: {
                userId,
              },
              select: {
                id: true,
              },
            }
          : false,
      },
    });

    const hasMore = comments.length > COMMENTS_PER_PAGE;
    const commentsToReturn = hasMore ? comments.slice(0, -1) : comments;

    const commentsWithLikeStatus = commentsToReturn.map((comment) => ({
      ...comment,
      isLiked: userId ? comment.likes && comment.likes.length > 0 : false,
      likes: undefined, // Remove the likes array, we only needed it for checking
    }));

    return {
      success: true,
      comments: commentsWithLikeStatus,
      nextCursor: hasMore
        ? commentsToReturn[commentsToReturn.length - 1].id
        : null,
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch comments",
      comments: [],
      nextCursor: null,
      hasMore: false,
    };
  }
};

// Add a comment or reply
export const addComment = async (input: z.infer<typeof AddCommentSchema>) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", requiresAuth: true };
    }

    const validation = AddCommentSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    const { videoId, content, parentId } = validation.data;

    // If it's a reply, check if parent exists and is not itself a reply
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { parentId: true },
      });

      if (!parentComment) {
        return { success: false, error: "Parent comment not found" };
      }

      if (parentComment.parentId !== null) {
        return {
          success: false,
          error: "Cannot reply to a reply (flat structure only)",
        };
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        videoId,
        userId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    return {
      success: true,
      comment: {
        ...comment,
        isLiked: false,
      },
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add comment",
    };
  }
};

// Toggle comment like
export const toggleCommentLike = async (commentId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", requiresAuth: true };
    }

    const userId = session.user.id;

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });

      return { success: true, isLiked: false };
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });

      return { success: true, isLiked: true };
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle comment like",
    };
  }
};

// Delete comment (user can delete own, admin can delete any)
export const deleteComment = async (commentId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", requiresAuth: true };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    // Check if user is comment owner or admin
    const isOwner = comment.userId === session.user.id;
    const isAdmin = session.user.role === "Admin";

    if (!isOwner && !isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
};
