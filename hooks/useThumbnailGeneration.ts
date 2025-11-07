import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { generateClientThumbnails } from "@/lib/client-thumbnail-utils";
import { getThumbnailCount, type VideoType } from "@/utils/video-utils";

type Thumbnail = {
  id: string;
  data: string;
  timestamp: number;
};

type UseThumbnailGenerationOptions = {
  videoFile: File | null;
  videoType: VideoType | null;
};

export const useThumbnailGeneration = ({
  videoFile,
  videoType,
}: UseThumbnailGenerationOptions) => {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(true);
  const hasGeneratedRef = useRef(false);

  const generateThumbnails = async (showToast: boolean = false) => {
    if (!videoFile || !videoType) {
      toast.error("No video file selected");
      return;
    }

    setIsGenerating(true);

    try {
      const thumbnailCount = getThumbnailCount(videoType);
      const generatedThumbnails = await generateClientThumbnails(
        videoFile,
        thumbnailCount
      );

      setThumbnails(generatedThumbnails);
      setSelectedThumbnail(null);

      if (showToast) {
        toast.success("Thumbnails regenerated!");
      }
    } catch (error) {
      console.error("Thumbnail generation error:", error);
      toast.error("Failed to generate thumbnails");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate thumbnails on mount (once only, prevent Strict Mode double execution)
  useEffect(() => {
    if (hasGeneratedRef.current) {
      return;
    }

    hasGeneratedRef.current = true;
    generateThumbnails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const regenerateThumbnails = () => {
    generateThumbnails(true);
  };

  return {
    thumbnails,
    selectedThumbnail,
    setSelectedThumbnail,
    isGenerating,
    regenerateThumbnails,
  };
};

