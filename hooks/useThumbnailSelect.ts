import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatTimestamp } from "@/lib/stream-utils";
import { useStreamUpload } from "@/hooks/useStreamUpload";
import { checkStreamVideoStatus } from "@/app/actions/stream-upload";
import { uploadVideo } from "@/app/actions/video";
import { uploadThumbnailDirect } from "@/app/actions/r2-upload";
import type { UploadData } from "@/components/admin/AddVideoDialog";
import { ASPECT_RATIOS, THUMBNAIL_CONSTRAINTS } from "@/lib/constants";

export type ThumbnailSource = "stream" | "custom";

type UseThumbnailSelectOptions = {
  uploadData: UploadData;
  onPublishSuccess: (videoId: string) => void;
};

export const useThumbnailSelect = ({
  uploadData,
  onPublishSuccess,
}: UseThumbnailSelectOptions) => {
  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  // Thumbnail selection state
  const [thumbnailSource, setThumbnailSource] =
    useState<ThumbnailSource>("stream");
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [timestampInputValue, setTimestampInputValue] = useState("00:00");
  const [framePreview, setFramePreview] = useState<string | null>(null);
  const [isLoadingFrame, setIsLoadingFrame] = useState(true);

  // Custom thumbnail state
  const [customThumbnailFile, setCustomThumbnailFile] = useState<File | null>(
    null
  );
  const [customThumbnailPreview, setCustomThumbnailPreview] = useState<
    string | null
  >(null);

  // Video object URL
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitialFrameRef = useRef(false);

  // Derived values
  const videoDuration = uploadData.duration || 0;
  const isShorts = uploadData.videoType === "Shorts";
  const isCustomSelected = thumbnailSource === "custom";

  // Stream upload hook
  const { uploadToStream } = useStreamUpload();

  // Create video object URL
  useEffect(() => {
    if (!uploadData.videoFile) return;

    // Reset initial frame flag when video changes
    hasInitialFrameRef.current = false;

    const url = URL.createObjectURL(uploadData.videoFile);
    setVideoObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [uploadData.videoFile]);

  // Create canvas for frame capture
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
  }, []);

  // Capture the current frame from the video element
  const captureCurrentFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Ensure video has dimensions before capturing
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setFramePreview(dataUrl);
    setIsLoadingFrame(false);
  }, []);

  // Handle video data loaded
  const handleVideoCanPlay = useCallback(() => {
    if (hasInitialFrameRef.current) return;
    hasInitialFrameRef.current = true;

    const video = videoRef.current;
    if (!video) return;

    if (video.currentTime === 0) {
      requestAnimationFrame(() => {
        captureCurrentFrame();
      });
    } else {
      video.currentTime = 0;
    }
  }, [captureCurrentFrame]);

  // Handle seeking completed
  const handleSeeked = useCallback(() => {
    requestAnimationFrame(() => {
      captureCurrentFrame();
    });
  }, [captureCurrentFrame]);

  // Handle timestamp change from slider
  const handleSliderChange = useCallback((value: number[]) => {
    const timestamp = value[0];
    setCurrentTimestamp(timestamp);
    setTimestampInputValue(formatTimestamp(timestamp));
    setIsLoadingFrame(true);

    const video = videoRef.current;
    if (video) {
      video.currentTime = timestamp;
    }
  }, []);

  // Handle timestamp input change
  const handleTimestampInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTimestampInputValue(e.target.value);
    },
    []
  );

  // Apply timestamp from input
  const applyTimestampFromInput = useCallback(() => {
    const value = timestampInputValue;
    let seconds = 0;

    if (value.includes(":")) {
      const parts = value.split(":");
      const minutes = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      seconds = minutes * 60 + secs;
    } else {
      seconds = parseFloat(value) || 0;
    }

    const clampedSeconds = Math.max(0, Math.min(seconds, videoDuration));
    setCurrentTimestamp(clampedSeconds);
    setTimestampInputValue(formatTimestamp(clampedSeconds));
    setIsLoadingFrame(true);

    const video = videoRef.current;
    if (video) {
      video.currentTime = clampedSeconds;
    }
  }, [timestampInputValue, videoDuration]);

  // Handle Enter key in timestamp input
  const handleTimestampKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyTimestampFromInput();
        (e.target as HTMLInputElement).blur();
      }
    },
    [applyTimestampFromInput]
  );

  // Validate custom thumbnail
  const validateCustomThumbnail = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      const fileType = file.type.toLowerCase();
      const isHeic =
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif");
      const allowedTypes: readonly string[] =
        THUMBNAIL_CONSTRAINTS.ALLOWED_TYPES;

      if (!allowedTypes.includes(fileType) && !isHeic) {
        return {
          valid: false,
          error: "Invalid file format. Allowed: JPG, PNG, HEIC, WebP",
        };
      }

      if (file.size > THUMBNAIL_CONSTRAINTS.MAX_SIZE) {
        return {
          valid: false,
          error: `File size exceeds 5MB limit (${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)}MB)`,
        };
      }

      return { valid: true };
    },
    []
  );

  // Handle custom thumbnail file select
  const handleCustomThumbnailSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      e.target.value = "";

      const basicValidation = validateCustomThumbnail(file);
      if (!basicValidation.valid) {
        toast.error(basicValidation.error || "Invalid file");
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) {
          toast.error("Failed to read file. Please try again.");
          return;
        }

        const img = new Image();

        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const expectedRatio = uploadData.videoType
            ? ASPECT_RATIOS[uploadData.videoType]
            : ASPECT_RATIOS.Normal;

          if (
            Math.abs(aspectRatio - expectedRatio) >
            THUMBNAIL_CONSTRAINTS.ASPECT_RATIO_TOLERANCE
          ) {
            const expectedRatioStr =
              uploadData.videoType === "Shorts" ? "9:16" : "16:9";
            toast.error(
              `Thumbnail must have ${expectedRatioStr} aspect ratio for ${uploadData.videoType} videos`
            );
            return;
          }

          setCustomThumbnailFile(file);
          setCustomThumbnailPreview(result);
          setThumbnailSource("custom");
          toast.success("Custom thumbnail selected");
        };

        img.onerror = () => {
          toast.error(
            "Invalid image file. Please select a valid JPG, PNG, HEIC, or WebP image."
          );
        };

        img.src = result;
      };

      reader.onerror = () => {
        toast.error("Failed to read file. Please try again.");
      };

      reader.readAsDataURL(file);
    },
    [uploadData.videoType, validateCustomThumbnail]
  );

  // Clear custom thumbnail
  const handleClearCustomThumbnail = useCallback(() => {
    setCustomThumbnailFile(null);
    setCustomThumbnailPreview(null);
    setThumbnailSource("stream");
  }, []);

  // Open file picker
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle publish
  const handlePublish = useCallback(async () => {
    if (thumbnailSource === "stream" && currentTimestamp === null) {
      toast.error("Please select a thumbnail timestamp");
      return;
    }

    if (thumbnailSource === "custom" && !customThumbnailFile) {
      toast.error("Please select a custom thumbnail");
      return;
    }

    if (
      !uploadData.videoFile ||
      !uploadData.gameType ||
      !uploadData.title ||
      !uploadData.videoType
    ) {
      toast.error("Missing required data");
      return;
    }

    setIsPublishing(true);
    setPublishProgress(0);

    try {
      // Step 1: Upload video to Stream (0% → 50%)
      setPublishProgress(10);
      toast.info("Uploading video to Stream...");

      const thumbnailTimestampPct =
        thumbnailSource === "stream" && videoDuration > 0
          ? Math.min(1, Math.max(0, currentTimestamp / videoDuration))
          : undefined;

      const videoUid = await uploadToStream({
        videoFile: uploadData.videoFile,
        thumbnailTimestampPct,
      });

      if (!videoUid) {
        toast.error("Failed to upload video");
        setIsPublishing(false);
        return;
      }

      setPublishProgress(50);

      // Step 2: Wait for video processing (50% → 65%)
      toast.info("Processing video...");

      let attempts = 0;
      const maxAttempts = 30;
      while (attempts < maxAttempts) {
        const statusResult = await checkStreamVideoStatus({ uid: videoUid });
        if (statusResult.success && statusResult.ready) {
          break;
        }
        const progressIncrement = (15 / maxAttempts) * attempts;
        setPublishProgress(50 + Math.round(progressIncrement));
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      setPublishProgress(65);

      // Step 3: Upload custom thumbnail to R2 if needed (65% → 80%)
      let customThumbnailKey: string | undefined;

      if (thumbnailSource === "custom" && customThumbnailPreview) {
        toast.info("Uploading custom thumbnail...");

        const thumbnailResult = await uploadThumbnailDirect({
          thumbnailBase64: customThumbnailPreview,
          contentType: customThumbnailFile?.type || "image/jpeg",
          videoType: uploadData.videoType,
        });

        if (!thumbnailResult.success) {
          toast.error(
            thumbnailResult.error || "Failed to upload custom thumbnail"
          );
          setIsPublishing(false);
          return;
        }

        customThumbnailKey = thumbnailResult.objectKey;
      }

      setPublishProgress(80);

      // Step 4: Save metadata to database (80% → 100%)
      toast.info("Saving video metadata...");

      const result = await uploadVideo({
        streamUid: videoUid,
        gameType: uploadData.gameType,
        videoType: uploadData.videoType,
        title: uploadData.title,
        description: uploadData.description,
        tags: uploadData.tags,
        duration: uploadData.duration || undefined,
        thumbnailSource,
        thumbnailTimestamp:
          thumbnailSource === "stream" ? currentTimestamp : undefined,
        customThumbnailKey,
      });

      setPublishProgress(100);

      if (result.success) {
        toast.success("Video published successfully!");
        if (result.videoId) {
          onPublishSuccess(result.videoId);
        }
      } else {
        toast.error(result.error || "Failed to publish video");
      }
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Failed to publish video");
    } finally {
      setIsPublishing(false);
    }
  }, [
    thumbnailSource,
    currentTimestamp,
    customThumbnailFile,
    customThumbnailPreview,
    uploadData,
    videoDuration,
    uploadToStream,
    onPublishSuccess,
  ]);

  return {
    // State
    isPublishing,
    publishProgress,
    thumbnailSource,
    currentTimestamp,
    timestampInputValue,
    framePreview,
    isLoadingFrame,
    customThumbnailPreview,
    videoObjectUrl,

    // Derived
    videoDuration,
    isShorts,
    isCustomSelected,

    // Refs
    videoRef,
    fileInputRef,

    // Handlers
    handleVideoCanPlay,
    handleSeeked,
    handleSliderChange,
    handleTimestampInputChange,
    applyTimestampFromInput,
    handleTimestampKeyDown,
    handleCustomThumbnailSelect,
    handleClearCustomThumbnail,
    openFilePicker,
    handlePublish,
  };
};
