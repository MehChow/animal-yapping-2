"use server";

import { requireRole } from "@/lib/auth-utils";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

type GetThumbnailUploadUrlInput = {
  fileName: string;
  contentType: string;
  fileSize: number;
};

type GetThumbnailUploadUrlResult = {
  success: boolean;
  uploadUrl?: string;
  objectKey?: string;
  error?: string;
};

/**
 * Get a presigned URL for uploading a custom thumbnail to R2
 */
export const getThumbnailUploadUrl = async (
  input: GetThumbnailUploadUrlInput
): Promise<GetThumbnailUploadUrlResult> => {
  try {
    // Verify admin role
    await requireRole(["Admin"]);

    const { fileName, contentType, fileSize } = input;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!bucketName) {
      return {
        success: false,
        error: "R2 bucket not configured",
      };
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return {
        success: false,
        error: "Thumbnail file size exceeds 5MB limit",
      };
    }

    // Validate content type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      return {
        success: false,
        error: "Invalid file type. Allowed: JPG, PNG, WebP, HEIC",
      };
    }

    const client = getR2Client();

    // Generate unique object key
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
    const objectKey = `thumbnails/${timestamp}-${randomStr}.${extension}`;

    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 }); // 1 hour

    return {
      success: true,
      uploadUrl,
      objectKey,
    };
  } catch (error) {
    console.error("Error getting thumbnail upload URL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get upload URL",
    };
  }
};

type UploadThumbnailDirectInput = {
  thumbnailBase64: string;
  contentType: string;
  videoType: "Normal" | "Shorts";
};

type UploadThumbnailDirectResult = {
  success: boolean;
  objectKey?: string;
  publicUrl?: string;
  error?: string;
};

/**
 * Upload a custom thumbnail directly to R2 (server-side upload)
 * This is useful when you have a base64 image from client
 */
export const uploadThumbnailDirect = async (
  input: UploadThumbnailDirectInput
): Promise<UploadThumbnailDirectResult> => {
  try {
    // Verify admin role
    await requireRole(["Admin"]);

    const { thumbnailBase64, contentType, videoType } = input;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!bucketName) {
      return {
        success: false,
        error: "R2 bucket not configured",
      };
    }

    // Convert base64 to buffer
    const base64Data = thumbnailBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return {
        success: false,
        error: "Thumbnail file size exceeds 5MB limit",
      };
    }

    const client = getR2Client();

    // Generate unique object key
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const extension = contentType.split("/")[1] || "jpg";
    const objectKey = `thumbnails/${videoType.toLowerCase()}/${timestamp}-${randomStr}.${extension}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000", // 1 year cache
    });

    await client.send(command);

    return {
      success: true,
      objectKey,
      publicUrl: publicUrl ? `${publicUrl}/${objectKey}` : undefined,
    };
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload thumbnail",
    };
  }
};

type DeleteThumbnailInput = {
  objectKey: string;
};

type DeleteThumbnailResult = {
  success: boolean;
  error?: string;
};

/**
 * Delete a custom thumbnail from R2
 */
export const deleteThumbnail = async (
  input: DeleteThumbnailInput
): Promise<DeleteThumbnailResult> => {
  try {
    // Verify admin role
    await requireRole(["Admin"]);

    const { objectKey } = input;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!bucketName) {
      return {
        success: false,
        error: "R2 bucket not configured",
      };
    }

    const client = getR2Client();

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    await client.send(command);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting thumbnail:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete thumbnail",
    };
  }
};

