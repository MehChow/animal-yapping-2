/**
 * Common video utilities
 */

export const VIDEO_CONSTRAINTS = {
  MAX_SIZE: 200 * 1024 * 1024, // 200MB
  ALLOWED_TYPES: ["video/mp4", "video/quicktime", "video/webm"],
  MIN_DURATION_FOR_THUMBNAILS: 3, // seconds
  SHORTS_MAX_DURATION: 60, // seconds
  ASPECT_RATIO_TOLERANCE: 0.1,
} as const;

export const ASPECT_RATIOS = {
  NORMAL: 16 / 9,
  SHORTS: 9 / 16,
} as const;

export type VideoType = "Normal" | "Shorts";

export type VideoMetadata = {
  width: number;
  height: number;
  duration: number;
  aspectRatio: number;
};

/**
 * Format file size to human readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Validate video file type
 */
export const isValidVideoType = (fileType: string): boolean => {
  return VIDEO_CONSTRAINTS.ALLOWED_TYPES.includes(fileType as any);
};

/**
 * Validate video file size
 */
export const isValidVideoSize = (fileSize: number): boolean => {
  return fileSize <= VIDEO_CONSTRAINTS.MAX_SIZE;
};

/**
 * Read video metadata from file
 */
export const readVideoMetadata = (file: File): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const metadata: VideoMetadata = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        aspectRatio: video.videoWidth / video.videoHeight,
      };
      resolve(metadata);
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video metadata"));
    };

    video.src = URL.createObjectURL(file);
  });
};

/**
 * Classify video type based on aspect ratio and duration
 */
export const classifyVideoType = (
  metadata: VideoMetadata
): { type: VideoType; error?: string } => {
  const { aspectRatio, duration, width, height } = metadata;

  const is16By9 =
    Math.abs(aspectRatio - ASPECT_RATIOS.NORMAL) <
    VIDEO_CONSTRAINTS.ASPECT_RATIO_TOLERANCE;
  const is9By16 =
    Math.abs(aspectRatio - ASPECT_RATIOS.SHORTS) <
    VIDEO_CONSTRAINTS.ASPECT_RATIO_TOLERANCE;

  if (is16By9) {
    return { type: "Normal" };
  } else if (is9By16) {
    if (duration > VIDEO_CONSTRAINTS.SHORTS_MAX_DURATION) {
      return {
        type: "Shorts",
        error: `Shorts videos must be ${
          VIDEO_CONSTRAINTS.SHORTS_MAX_DURATION
        } seconds or less. Your video is ${Math.round(duration)} seconds.`,
      };
    }
    return { type: "Shorts" };
  } else {
    return {
      type: "Normal",
      error: `Invalid aspect ratio (${width}x${height}, ${aspectRatio.toFixed(
        2
      )}:1). Please use 16:9 for Normal videos or 9:16 for Shorts videos.`,
    };
  }
};

/**
 * Get thumbnail count based on video type
 */
export const getThumbnailCount = (videoType: VideoType): number => {
  return videoType === "Shorts" ? 5 : 3;
};
