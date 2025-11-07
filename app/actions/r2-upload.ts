"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2-client";
import { requireRole } from "@/lib/auth-utils";

type GeneratePresignedUrlInput = {
  fileName: string;
  fileType: string;
  fileSize: number;
};

export const generateVideoUploadUrl = async (
  input: GeneratePresignedUrlInput
) => {
  try {
    // Verify admin role
    await requireRole(["Admin"]);

    const { fileName, fileType, fileSize } = input;

    // Validate file size (200MB)
    const MAX_SIZE = 200 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return {
        success: false,
        error: "Video file size exceeds 200MB limit",
      };
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/webm"];
    if (!allowedTypes.includes(fileType)) {
      return {
        success: false,
        error: "Invalid file type. Only .mp4, .mov, and .webm are allowed",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/\s+/g, "-");
    const key = `videos/${timestamp}-${sanitizedName}`;

    // Create pre-signed PUT URL (expires in 1 hour)
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Construct the final public URL
    const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : key;

    return {
      success: true,
      presignedUrl,
      publicUrl,
      key,
    };
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate upload URL",
    };
  }
};

export const generateThumbnailUploadUrl = async () => {
  try {
    // Verify admin role
    await requireRole(["Admin"]);

    // Generate unique filename
    const timestamp = Date.now();
    const key = `thumbnails/${timestamp}-thumbnail.jpg`;

    // Create pre-signed PUT URL (expires in 1 hour)
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: "image/jpeg",
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Construct the final public URL
    const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : key;

    return {
      success: true,
      presignedUrl,
      publicUrl,
      key,
    };
  } catch (error) {
    console.error("Error generating thumbnail pre-signed URL:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate upload URL",
    };
  }
};

