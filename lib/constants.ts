export const THUMBNAIL_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "image/webp",
  ],
  ASPECT_RATIO_TOLERANCE: 0.15,
} as const;

export const POST_IMAGE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB per image
  MAX_IMAGES: 5,
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "image/webp",
    "image/gif",
  ],
  MAX_CONTENT_LENGTH: 1000,
} as const;

export const VIDEO_CONSTRAINTS = {
  MAX_SIZE: 200 * 1024 * 1024, // 200MB
  ALLOWED_TYPES: ["video/mp4", "video/quicktime", "video/webm"],
  MIN_DURATION_FOR_THUMBNAILS: 3, // seconds
  SHORTS_MAX_DURATION: 60, // seconds
  ASPECT_RATIO_TOLERANCE: 0.1,
} as const;

export const ASPECT_RATIOS = {
  Normal: 16 / 9,
  Shorts: 9 / 16,
} as const;
