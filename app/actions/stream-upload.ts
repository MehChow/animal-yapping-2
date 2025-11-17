"use server";

import { requireRole } from "@/lib/auth-utils";

type GetStreamUploadUrlInput = {
  fileSize: number;
};

export const getStreamUploadUrl = async (input: GetStreamUploadUrlInput) => {
  try {
    // Verify admin role
    await requireRole(["Admin"]);

    const { fileSize } = input;

    // Validate file size (200MB)
    const MAX_SIZE = 200 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return {
        success: false,
        error: "Video file size exceeds 200MB limit",
      };
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_TOKEN;

    if (!accountId || !apiToken) {
      return {
        success: false,
        error: "Cloudflare Stream not configured",
      };
    }

    return {
      success: true,
      uploadUrl: `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
      apiToken,
    };
  } catch (error) {
    console.error("Error getting Stream upload URL:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get upload URL",
    };
  }
};

type CheckStreamVideoStatusInput = {
  uid: string;
};

export const checkStreamVideoStatus = async (
  input: CheckStreamVideoStatusInput
) => {
  try {
    const { uid } = input;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_TOKEN;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${uid}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to check video status" };
    }

    const data = await response.json();
    const video = data.result;

    return {
      success: true,
      status: video.status.state, // "queued", "inprogress", "ready", "error"
      duration: video.duration,
      ready: video.readyToStream,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Status check failed",
    };
  }
};

type SetStreamThumbnailInput = {
  videoUid: string;
  thumbnailDataUrl: string;
  timestamp: number; // Which second in the video
};

export const setStreamThumbnail = async (input: SetStreamThumbnailInput) => {
  try {
    // Verify admin role
    await requireRole(["Admin"]);

    const { videoUid, thumbnailDataUrl, timestamp } = input;

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_TOKEN;

    if (!accountId || !apiToken) {
      return {
        success: false,
        error: "Cloudflare Stream not configured",
      };
    }

    // Option 1: Try to set thumbnail timestamp first (requires video to be processed)
    const statusResult = await checkStreamVideoStatus({ uid: videoUid });
    if (
      statusResult.success &&
      statusResult.duration &&
      statusResult.duration > 0
    ) {
      const thumbnailTimestampPct = Math.max(
        0,
        Math.min(1, timestamp / statusResult.duration)
      );
      const timestampResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoUid}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thumbnailTimestampPct,
          }),
        }
      );

      if (timestampResponse.ok) {
        return {
          success: true,
          message: "Thumbnail timestamp set successfully",
          method: "timestamp",
        };
      }
    }

    // Option 2: If timestamp fails, try uploading custom image
    try {
      const response = await fetch(thumbnailDataUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob, "thumbnail.jpg");

      const uploadResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoUid}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const error = await uploadResponse.text();
        console.error("Thumbnail upload error:", error);
        return {
          success: false,
          error: `Failed to set thumbnail: ${error}`,
        };
      }

      return {
        success: true,
        message: "Thumbnail uploaded successfully",
        method: "upload",
      };
    } catch (uploadError) {
      console.error("Thumbnail upload error:", uploadError);
      return {
        success: false,
        error: "Both thumbnail methods failed",
      };
    }
  } catch (error) {
    console.error("Error setting thumbnail:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set thumbnail",
    };
  }
};
