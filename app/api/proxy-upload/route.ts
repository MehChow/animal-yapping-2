"use server";

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { POST_IMAGE_CONSTRAINTS } from "@/lib/constants";
import { requireRole } from "@/lib/auth-utils";

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

export async function POST(request: NextRequest) {
  try {
    // Verify admin role
    await requireRole(["Admin"]);

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const index = parseInt(formData.get("index") as string) || 0;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { success: false, error: "R2 bucket not configured" },
        { status: 500 }
      );
    }

    // Validate file size
    if (file.size > POST_IMAGE_CONSTRAINTS.MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File exceeds ${
            POST_IMAGE_CONSTRAINTS.MAX_SIZE / 1024 / 1024
          }MB limit`,
        },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = POST_IMAGE_CONSTRAINTS.ALLOWED_TYPES;
    if (
      !allowedTypes.includes(
        file.type.toLowerCase() as (typeof POST_IMAGE_CONSTRAINTS.ALLOWED_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Allowed: JPG, PNG, HEIC, WebP, GIF",
        },
        { status: 400 }
      );
    }

    const client = getR2Client();

    // Generate unique object key
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const objectKey = `posts/${timestamp}-${randomStr}-${index}.${extension}`;

    // Upload directly to R2
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type,
    });

    await client.send(command);

    return NextResponse.json({
      success: true,
      objectKey,
    });
  } catch (error) {
    console.error("Error in proxy upload:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
