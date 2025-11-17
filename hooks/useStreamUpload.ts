import { useState } from "react";
import { toast } from "sonner";
import { getStreamUploadUrl } from "@/app/actions/stream-upload";
import * as tus from "tus-js-client";

export const useStreamUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [streamUid, setStreamUid] = useState<string | null>(null);

  type UploadParams = {
    videoFile: File;
    thumbnailTimestampPct?: number;
  };

  const uploadToStream = async ({
    videoFile,
    thumbnailTimestampPct,
  }: UploadParams): Promise<string | null> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get upload URL from server
      const result = await getStreamUploadUrl({
        fileSize: videoFile.size,
      });

      if (!result.success || !result.uploadUrl) {
        toast.error(result.error || "Failed to get upload URL");
        setIsUploading(false);
        return null;
      }

      const { uploadUrl, apiToken } = result;
      let detectedUid: string | null = null;

      const metadata = {
        name: videoFile.name,
        filetype: videoFile.type || "video/mp4",
      };

      return new Promise((resolve, reject) => {
        const upload = new tus.Upload(videoFile, {
          endpoint: uploadUrl,
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
          metadata: {
            ...metadata,
            ...(typeof thumbnailTimestampPct === "number"
              ? { thumbnailtimestamppct: thumbnailTimestampPct.toString() }
              : {}),
          },
          uploadSize: videoFile.size,
          chunkSize: 52_428_800, // 50MB as recommended for better performance
          retryDelays: [0, 3000, 5000, 10000, 20000],
          onAfterResponse: (_req, res) => {
            const header = res?.getHeader?.("stream-media-id");
            if (header && typeof header === "string") {
              detectedUid = header;
              setStreamUid(header);
            }
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            if (bytesTotal) {
              const percentage = Math.min(
                100,
                Math.round((bytesUploaded / bytesTotal) * 100)
              );
              setUploadProgress(percentage);
            }
          },
          onSuccess: () => {
            setIsUploading(false);
            setUploadProgress(100);
            toast.success("Video uploaded! Processing...");
            resolve(detectedUid);
          },
          onError: (error) => {
            setIsUploading(false);
            toast.error("Failed to upload video");
            reject(error);
          },
        });

        upload.start();
      });
    } catch (error) {
      console.error("Stream upload error:", error);
      toast.error("Failed to upload video");
      setIsUploading(false);
      return null;
    }
  };

  return {
    uploadToStream,
    isUploading,
    uploadProgress,
    streamUid,
  };
};
