/**
 * Utility functions for Cloudflare Stream and thumbnails
 */
import type { VideoThumbnailInfo } from "@/types/thumbnail";

/**
 * Get the thumbnail URL for a video
 * Handles both Cloudflare Stream thumbnails and custom R2 thumbnails
 * @param video Video thumbnail information
 * @returns The thumbnail URL
 */
export const getThumbnailUrl = (video: VideoThumbnailInfo): string => {
  const { streamUid, thumbnailSource, thumbnailTimestamp, customThumbnailKey } =
    video;

  // If custom thumbnail, return R2 URL
  if (thumbnailSource === "custom" && customThumbnailKey) {
    const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (r2PublicUrl) {
      return `${r2PublicUrl}/${customThumbnailKey}`;
    }
    // Fallback to stream if R2 URL not configured
    console.warn(
      "⚠️  NEXT_PUBLIC_R2_PUBLIC_URL not set, falling back to Stream thumbnail"
    );
  }

  // Use Cloudflare Stream thumbnail
  return getStreamThumbnailUrl(streamUid, thumbnailTimestamp);
};

/**
 * Get the thumbnail URL for a Cloudflare Stream video
 * @param streamUid The Cloudflare Stream video UID
 * @param timestamp Optional timestamp in seconds to get a specific frame
 * @returns The thumbnail URL
 */
export const getStreamThumbnailUrl = (
  streamUid: string | null,
  timestamp?: number | null
): string => {
  if (!streamUid) {
    // Return a data URL for a simple gray placeholder
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%239CA3AF'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";
  }

  const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE;

  if (!customerCode) {
    console.warn(
      "⚠️  NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE not set in .env.local"
    );
    console.warn(
      "   Add: NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE=your_customer_code"
    );
    // Return a data URL for a warning placeholder
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='%23DC2626'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='white'%3EConfig Error%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'%3ENEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE not set%3C/text%3E%3C/svg%3E";
  }

  // Build thumbnail URL with optional timestamp
  const baseUrl = `https://${customerCode}.cloudflarestream.com/${streamUid}/thumbnails/thumbnail.jpg`;

  if (timestamp !== undefined && timestamp !== null && timestamp > 0) {
    return `${baseUrl}?time=${timestamp}s`;
  }

  return baseUrl;
};

/**
 * Get the animated GIF URL for a Cloudflare Stream video
 * @param streamUid The Cloudflare Stream video UID
 * @param timestamp Optional start timestamp in seconds
 * @returns The animated GIF URL
 */
export const getStreamGifUrl = (
  streamUid: string | null,
  timestamp?: number | null
): string => {
  if (!streamUid) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%239CA3AF'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";
  }

  const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE;

  if (!customerCode) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='%23DC2626'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='white'%3EConfig Error%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'%3ENEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE not set%3C/text%3E%3C/svg%3E";
  }

  const baseUrl = `https://${customerCode}.cloudflarestream.com/${streamUid}/thumbnails/thumbnail.gif`;

  if (timestamp !== undefined && timestamp !== null && timestamp > 0) {
    return `${baseUrl}?time=${timestamp}s`;
  }

  return baseUrl;
};

/**
 * Format timestamp as MM:SS
 */
export const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Parse timestamp from MM:SS or seconds string
 */
export const parseTimestamp = (value: string): number => {
  if (value.includes(":")) {
    const parts = value.split(":");
    const minutes = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return minutes * 60 + secs;
  }
  return parseFloat(value) || 0;
};

/**
 * Get the Cloudflare Stream video manifest URL for playback
 * @param streamUid The Cloudflare Stream video UID
 * @returns The manifest URL
 */
export const getStreamVideoUrl = (streamUid: string | null): string | null => {
  if (!streamUid) {
    return null;
  }

  const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE;

  if (!customerCode) {
    return null;
  }

  return `https://${customerCode}.cloudflarestream.com/${streamUid}/manifest/video.m3u8`;
};