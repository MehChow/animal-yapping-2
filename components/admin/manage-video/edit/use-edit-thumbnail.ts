"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatTimestamp, parseTimestamp } from "@/lib/stream-utils";
import { THUMBNAIL_CONSTRAINTS, ASPECT_RATIOS } from "@/lib/constants";
import type { ThumbnailSource, ThumbnailUpdateData } from "@/types/thumbnail";

type UseEditThumbnailProps = {
  streamUid: string | null;
  videoType: "Normal" | "Shorts";
  videoDuration: number;
  currentThumbnailSource: ThumbnailSource;
  currentThumbnailTimestamp: number | null;
  currentCustomThumbnailKey: string | null;
};

export const useEditThumbnail = ({
  streamUid,
  videoType,
  videoDuration,
  currentThumbnailSource,
  currentThumbnailTimestamp,
  currentCustomThumbnailKey,
}: UseEditThumbnailProps) => {
  const [thumbnailSource, setThumbnailSource] = useState<ThumbnailSource>(
    currentThumbnailSource
  );
  const [currentTimestamp, setCurrentTimestamp] = useState(
    currentThumbnailTimestamp || 0
  );
  const [timestampInputValue, setTimestampInputValue] = useState(
    formatTimestamp(currentThumbnailTimestamp || 0)
  );
  const [framePreview, setFramePreview] = useState<string | null>(null);
  const [isLoadingFrame, setIsLoadingFrame] = useState(false);

  const [customThumbnailFile, setCustomThumbnailFile] = useState<File | null>(
    null
  );
  const [customThumbnailPreview, setCustomThumbnailPreview] = useState<
    string | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isShorts = videoType === "Shorts";
  const isCustomSelected = thumbnailSource === "custom";

  // Load initial thumbnail preview
  useEffect(() => {
    if (currentThumbnailSource === "stream" && streamUid) {
      loadFramePreview(streamUid, currentThumbnailTimestamp || 0);
    } else if (
      currentThumbnailSource === "custom" &&
      currentCustomThumbnailKey
    ) {
      // Load existing custom thumbnail
      const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
      if (r2PublicUrl) {
        const customThumbnailUrl = `${r2PublicUrl}/${currentCustomThumbnailKey}`;
        setCustomThumbnailPreview(customThumbnailUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const loadFramePreview = useCallback((uid: string, timestamp: number) => {
    if (!uid) return;

    setIsLoadingFrame(true);
    const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE;
    if (!customerCode) {
      setIsLoadingFrame(false);
      return;
    }

    const thumbnailUrl = `https://${customerCode}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg?time=${timestamp}s`;

    // Load the thumbnail image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setFramePreview(thumbnailUrl);
      setIsLoadingFrame(false);
    };
    img.onerror = () => {
      setIsLoadingFrame(false);
    };
    img.src = thumbnailUrl;
  }, []);

  const handleSliderChange = useCallback(
    (value: number[]) => {
      const newTimestamp = value[0];
      setCurrentTimestamp(newTimestamp);
      setTimestampInputValue(formatTimestamp(newTimestamp));

      if (streamUid && thumbnailSource === "stream") {
        loadFramePreview(streamUid, newTimestamp);
      }
    },
    [thumbnailSource, streamUid, loadFramePreview]
  );

  const handleTimestampInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTimestampInputValue(e.target.value);
    },
    []
  );

  const applyTimestampFromInput = useCallback(() => {
    const parsed = parseTimestamp(timestampInputValue);
    const clamped = Math.max(0, Math.min(parsed, videoDuration));
    setCurrentTimestamp(clamped);
    setTimestampInputValue(formatTimestamp(clamped));

    if (streamUid && thumbnailSource === "stream") {
      loadFramePreview(streamUid, clamped);
    }
  }, [
    timestampInputValue,
    videoDuration,
    thumbnailSource,
    streamUid,
    loadFramePreview,
  ]);

  const handleTimestampKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyTimestampFromInput();
      }
    },
    [applyTimestampFromInput]
  );

  const handleCustomThumbnailSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!THUMBNAIL_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as any)) {
        toast.error("Invalid file type. Allowed: JPG, PNG, WebP, HEIC");
        return;
      }

      // Validate file size
      if (file.size > THUMBNAIL_CONSTRAINTS.MAX_SIZE) {
        toast.error("File size exceeds 5MB limit");
        return;
      }

      // Validate aspect ratio
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const expectedAspectRatio = ASPECT_RATIOS[videoType];
          const tolerance = THUMBNAIL_CONSTRAINTS.ASPECT_RATIO_TOLERANCE;

          if (
            Math.abs(aspectRatio - expectedAspectRatio) >
            expectedAspectRatio * tolerance
          ) {
            toast.error(
              `Invalid aspect ratio. Expected ${
                videoType === "Shorts" ? "9:16" : "16:9"
              }`
            );
            return;
          }

          setCustomThumbnailFile(file);
          setCustomThumbnailPreview(event.target?.result as string);
          setThumbnailSource("custom");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [videoType]
  );

  const handleClearCustomThumbnail = useCallback(() => {
    setCustomThumbnailFile(null);
    setCustomThumbnailPreview(null);
    setThumbnailSource("stream");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const switchToStream = useCallback(() => {
    setThumbnailSource("stream");
    setCustomThumbnailFile(null);
    setCustomThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (streamUid) {
      loadFramePreview(streamUid, currentTimestamp);
    }
  }, [streamUid, currentTimestamp, loadFramePreview]);

  // Check if thumbnail has changed
  const hasThumbnailChanged = () => {
    if (thumbnailSource !== currentThumbnailSource) {
      return true;
    }

    if (thumbnailSource === "stream") {
      return (
        currentThumbnailTimestamp === null ||
        Math.abs(currentTimestamp - (currentThumbnailTimestamp || 0)) > 0.1
      );
    }

    if (thumbnailSource === "custom") {
      return customThumbnailFile !== null;
    }

    return false;
  };

  return {
    // State
    thumbnailSource,
    currentTimestamp,
    timestampInputValue,
    framePreview,
    isLoadingFrame,
    customThumbnailPreview,
    isCustomSelected,
    isShorts,

    // Refs
    fileInputRef,

    // Handlers
    handleSliderChange,
    handleTimestampInputChange,
    applyTimestampFromInput,
    handleTimestampKeyDown,
    handleCustomThumbnailSelect,
    handleClearCustomThumbnail,
    openFilePicker,
    switchToStream,
    setThumbnailSource,

    // Utils
    hasThumbnailChanged,
    getThumbnailData: (): ThumbnailUpdateData => {
      if (thumbnailSource === "stream") {
        return {
          thumbnailSource: "stream" as const,
          thumbnailTimestamp: currentTimestamp,
          customThumbnailKey: null,
        };
      } else {
        return {
          thumbnailSource: "custom" as const,
          thumbnailTimestamp: null,
          customThumbnailPreview: customThumbnailPreview || null,
          customThumbnailContentType: customThumbnailFile?.type || null,
          // Keep old key if not uploading new one
          oldCustomThumbnailKey:
            currentThumbnailSource === "custom"
              ? currentCustomThumbnailKey
              : null,
        };
      }
    },
  };
};
