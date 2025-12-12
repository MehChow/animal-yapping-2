"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateVideo } from "@/app/actions/video";
import type { VideoMetadataForm } from "@/lib/validations/video";
import type { ThumbnailUpdateData } from "@/types/thumbnail";

type UseEditVideoProps = {
  videoId: string;
  initialData: {
    title: string;
    description?: string;
    tags: string[];
    gameType: string;
    videoType: "Normal" | "Shorts";
  };
  getThumbnailData?: () => ThumbnailUpdateData | undefined;
};

export const useEditVideo = ({
  videoId,
  initialData,
  getThumbnailData,
}: UseEditVideoProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: VideoMetadataForm) => {
    setIsSubmitting(true);

    try {
      const thumbnailData = getThumbnailData?.();
      // Only send thumbnail data if it exists (user interacted with thumbnail editor)
      const finalThumbnailData = thumbnailData ? thumbnailData : undefined;

      const result = await updateVideo({
        videoId,
        title: data.title,
        description: data.description || undefined,
        tags: data.tags,
        gameType: initialData.gameType,
        videoType: initialData.videoType,
        thumbnailData: finalThumbnailData,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to update video");
        return;
      }

      toast.success(result.message || "Video updated successfully!");
      router.push("/admin/manage-video");
      router.refresh();
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/manage-video");
  };

  return {
    handleSubmit,
    handleCancel,
    isSubmitting,
  };
};

