import { useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  generateVideoUploadUrl,
  generateThumbnailUploadUrl,
} from "@/app/actions/r2-upload";
import { uploadVideo } from "@/app/actions/video";
import { dataUrlToBlob } from "@/lib/client-thumbnail-utils";
import type { VideoType } from "@/utils/video-utils";

type PublishData = {
  videoFile: File;
  thumbnailDataUrl: string;
  gameType: string;
  videoType: VideoType;
  title: string;
  description: string;
  tags: string[];
};

export const useVideoPublish = () => {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const [optimisticProgress, setOptimisticProgress] = useOptimistic(
    uploadProgress,
    (state, newProgress: number) => newProgress
  );

  const publishVideo = async (data: PublishData): Promise<boolean> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          // Step 1: Upload video to R2 (10% → 35%)
          setOptimisticProgress(10);
          setUploadProgress(10);

          const videoUrlResult = await generateVideoUploadUrl({
            fileName: data.videoFile.name,
            fileType: data.videoFile.type,
            fileSize: data.videoFile.size,
          });

          if (
            !videoUrlResult.success ||
            !videoUrlResult.presignedUrl ||
            !videoUrlResult.publicUrl
          ) {
            toast.error(
              videoUrlResult.error || "Failed to get video upload URL"
            );
            setUploadProgress(0);
            resolve(false);
            return;
          }

          setOptimisticProgress(20);
          setUploadProgress(20);

          const videoUploadResponse = await fetch(
            videoUrlResult.presignedUrl,
            {
              method: "PUT",
              body: data.videoFile,
              headers: {
                "Content-Type": data.videoFile.type,
              },
            }
          );

          if (!videoUploadResponse.ok) {
            toast.error("Failed to upload video");
            setUploadProgress(0);
            resolve(false);
            return;
          }

          setOptimisticProgress(35);
          setUploadProgress(35);

          // Step 2: Upload thumbnail to R2 (35% → 60%)
          const thumbnailBlob = await dataUrlToBlob(data.thumbnailDataUrl);

          setOptimisticProgress(45);
          setUploadProgress(45);

          const thumbnailUrlResult = await generateThumbnailUploadUrl();

          if (
            !thumbnailUrlResult.success ||
            !thumbnailUrlResult.presignedUrl ||
            !thumbnailUrlResult.publicUrl
          ) {
            toast.error(
              thumbnailUrlResult.error || "Failed to get thumbnail upload URL"
            );
            setUploadProgress(0);
            resolve(false);
            return;
          }

          setOptimisticProgress(50);
          setUploadProgress(50);

          const thumbnailUploadResponse = await fetch(
            thumbnailUrlResult.presignedUrl,
            {
              method: "PUT",
              body: thumbnailBlob,
              headers: {
                "Content-Type": "image/jpeg",
              },
            }
          );

          if (!thumbnailUploadResponse.ok) {
            toast.error("Failed to upload thumbnail");
            setUploadProgress(0);
            resolve(false);
            return;
          }

          setOptimisticProgress(60);
          setUploadProgress(60);

          // Step 3: Save metadata to database (60% → 100%)
          const result = await uploadVideo({
            videoUrl: videoUrlResult.publicUrl,
            thumbnailUrl: thumbnailUrlResult.publicUrl,
            gameType: data.gameType,
            videoType: data.videoType,
            title: data.title,
            description: data.description,
            tags: data.tags,
          });

          setOptimisticProgress(90);
          setUploadProgress(90);

          if (result.success) {
            setOptimisticProgress(100);
            setUploadProgress(100);
            toast.success("Video published successfully!");

            // Redirect to home page after a brief delay
            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 1000);

            resolve(true);
          } else {
            toast.error(result.error || "Failed to save video");
            setUploadProgress(0);
            resolve(false);
          }
        } catch (error) {
          console.error("Publish error:", error);
          toast.error("Failed to publish video");
          setUploadProgress(0);
          resolve(false);
        }
      });
    });
  };

  return {
    publishVideo,
    uploadProgress,
    optimisticProgress,
    isPending,
  };
};

