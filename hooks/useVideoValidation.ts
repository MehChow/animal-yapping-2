import { useState } from "react";
import { toast } from "sonner";
import {
  isValidVideoType,
  isValidVideoSize,
  readVideoMetadata,
  classifyVideoType,
  type VideoMetadata,
  type VideoType,
} from "@/utils/video-utils";

type ValidationResult = {
  isValid: boolean;
  videoType: VideoType | null;
  metadata: VideoMetadata | null;
};

export const useVideoValidation = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const validateAndAnalyzeVideo = async (
    file: File
  ): Promise<ValidationResult> => {
    setIsAnalyzing(true);

    try {
      // Validate file type
      if (!isValidVideoType(file.type)) {
        toast.error(
          "Invalid file type. Only .mp4, .mov, and .webm are allowed."
        );
        return { isValid: false, videoType: null, metadata: null };
      }

      // Validate file size
      if (!isValidVideoSize(file.size)) {
        toast.error("File size exceeds 200MB limit.");
        return { isValid: false, videoType: null, metadata: null };
      }

      // Read video metadata
      const metadata = await readVideoMetadata(file);

      // Classify video type
      const { type, error } = classifyVideoType(metadata);

      if (error) {
        toast.error(error);
        return { isValid: false, videoType: null, metadata: null };
      }

      // Success!
      toast.success(
        `Video classified as ${type} (${type === "Normal" ? "16:9" : "9:16"})`
      );

      return {
        isValid: true,
        videoType: type,
        metadata,
      };
    } catch (error) {
      console.error("Video validation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to analyze video"
      );
      return { isValid: false, videoType: null, metadata: null };
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    validateAndAnalyzeVideo,
  };
};

