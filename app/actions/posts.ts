"use server";

import { requireRole, getCurrentUser } from "@/lib/auth-utils";
import { PrismaClient } from "@/app/generated/prisma/client";
import { getPosts as getPostsData } from "@/lib/data/post";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import { POST_IMAGE_CONSTRAINTS } from "@/lib/constants";

const prisma = new PrismaClient();

const getR2Client = () => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 not configured. Missing environment variables.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

// Types for presigned URL
type GetPostImageUploadUrlInput = {
  fileName: string;
  contentType: string;
  fileSize: number;
  index: number;
};

type GetPostImageUploadUrlResult = {
  success: boolean;
  uploadUrl?: string;
  objectKey?: string;
  error?: string;
};

/**
 * Get a presigned URL for uploading a post image to R2
 */
export const getPostImageUploadUrl = async (
  input: GetPostImageUploadUrlInput
): Promise<GetPostImageUploadUrlResult> => {
  try {
    // Verify admin role
    await requireRole(["Admin"]);

    const { fileName, contentType, fileSize, index } = input;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!bucketName) {
      return { success: false, error: "R2 bucket not configured" };
    }

    // Validate file size
    if (fileSize > POST_IMAGE_CONSTRAINTS.MAX_SIZE) {
      return {
        success: false,
        error: `File exceeds ${
          POST_IMAGE_CONSTRAINTS.MAX_SIZE / 1024 / 1024
        }MB limit`,
      };
    }

    // Validate content type
    const allowedTypes: readonly string[] =
      POST_IMAGE_CONSTRAINTS.ALLOWED_TYPES;
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      return {
        success: false,
        error: "Invalid file type. Allowed: JPG, PNG, HEIC, WebP, GIF",
      };
    }

    const client = getR2Client();

    // Generate unique object key
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
    const objectKey = `posts/${timestamp}-${randomStr}-${index}.${extension}`;

    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

    return { success: true, uploadUrl, objectKey };
  } catch (error) {
    console.error("Error getting post image upload URL:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get upload URL",
    };
  }
};

// Types
type CreatePostInput = {
  content: string;
  imageKeys: string[]; // Object keys of already-uploaded images
};

type CreatePostResult = {
  success: boolean;
  postId?: string;
  error?: string;
};

type ToggleLikeResult = {
  success: boolean;
  isLiked?: boolean;
  likeCount?: number;
  error?: string;
};

/**
 * Create a new post (Admin only)
 * Images should already be uploaded via presigned URLs
 */
export const createPost = async (
  input: CreatePostInput
): Promise<CreatePostResult> => {
  try {
    // Verify admin role
    const user = await requireRole(["Admin"]);

    const { content, imageKeys } = input;

    // Validate content
    if (!content || content.trim().length === 0) {
      return { success: false, error: "Content is required" };
    }

    if (content.length > POST_IMAGE_CONSTRAINTS.MAX_CONTENT_LENGTH) {
      return {
        success: false,
        error: `Content must be ${POST_IMAGE_CONSTRAINTS.MAX_CONTENT_LENGTH} characters or less`,
      };
    }

    // Validate image count
    if (imageKeys.length > POST_IMAGE_CONSTRAINTS.MAX_IMAGES) {
      return {
        success: false,
        error: `Maximum ${POST_IMAGE_CONSTRAINTS.MAX_IMAGES} images allowed`,
      };
    }

    // Create post in database with image keys (already uploaded via presigned URLs)
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        images: {
          create: imageKeys.map((key, index) => ({
            imageKey: key,
            order: index,
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, postId: post.id };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create post",
    };
  }
};

/**
 * Get posts with pagination (Server action wrapper)
 */
export const getPosts = async (
  input: { cursor?: string; limit?: number } = {}
) => {
  const user = await getCurrentUser();
  return getPostsData({ ...input, userId: user?.id });
};

/**
 * Toggle like on a post
 */
export const togglePostLike = async (
  postId: string
): Promise<ToggleLikeResult> => {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "You must be logged in to like posts" };
    }

    const userId = user.id;

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
    }

    // Get updated like count
    const likeCount = await prisma.postLike.count({
      where: { postId },
    });

    return {
      success: true,
      isLiked: !existingLike,
      likeCount,
    };
  } catch (error) {
    console.error("Error toggling post like:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle like",
    };
  }
};

/**
 * Delete a post (Admin only)
 */
export const deletePost = async (
  postId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await requireRole(["Admin"]);

    // Get post with images
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { images: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // Delete images from R2
    if (post.images.length > 0) {
      const bucketName = process.env.R2_BUCKET_NAME;
      if (bucketName) {
        const client = getR2Client();
        for (const image of post.images) {
          try {
            await client.send(
              new DeleteObjectCommand({
                Bucket: bucketName,
                Key: image.imageKey,
              })
            );
          } catch (e) {
            console.error(`Failed to delete image ${image.imageKey}:`, e);
          }
        }
      }
    }

    // Delete post from database (cascade deletes images and likes)
    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete post",
    };
  }
};

/**
 * Get the public URL for a post image
 */
export async function getPostImageUrl(imageKey: string): Promise<string> {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/${imageKey}`;
  }
  return "";
}
