"use server";

import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { requireAuth } from "@/lib/auth-utils";
import { USER_ICON_CONSTRAINTS } from "@/lib/constants";

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
    const user = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > USER_ICON_CONSTRAINTS.MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Icon exceeds 5MB limit",
        },
        { status: 400 }
      );
    }

    const normalizedType = file.type.toLowerCase();
    if (
      !USER_ICON_CONSTRAINTS.ALLOWED_TYPES.includes(normalizedType as never)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Allowed: JPG, PNG, HEIC, WebP",
        },
        { status: 400 }
      );
    }

    const bucketName = process.env.R2_BUCKET_NAME;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    if (!bucketName) {
      return NextResponse.json(
        { success: false, error: "R2 bucket not configured" },
        { status: 500 }
      );
    }

    const client = getR2Client();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const objectKey = `user_icons/${user.id}-${timestamp}-${randomStr}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000",
    });

    await client.send(command);

    const normalizedRelativePath = `/${objectKey}`;
    const publicUrl = process.env.R2_PUBLIC_URL
      ? `${process.env.R2_PUBLIC_URL}/${objectKey}`
      : normalizedRelativePath;

    return NextResponse.json({
      success: true,
      objectKey,
      publicUrl,
    });
  } catch (error) {
    console.error("Error uploading user icon:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
