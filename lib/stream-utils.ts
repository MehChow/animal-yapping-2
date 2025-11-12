/**
 * Utility functions for Cloudflare Stream
 */

/**
 * Get the thumbnail URL for a Cloudflare Stream video
 * @param streamUid The Cloudflare Stream video UID
 * @returns The thumbnail URL
 */
export const getStreamThumbnailUrl = (streamUid: string | null): string => {
  if (!streamUid) {
    // Return a data URL for a simple gray placeholder
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%239CA3AF'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";
  }

  const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE;
  
  if (!customerCode) {
    console.warn("⚠️  NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE not set in .env.local");
    console.warn("   Add: NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE=your_customer_code");
    // Return a data URL for a warning placeholder
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='%23DC2626'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='white'%3EConfig Error%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'%3ENEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE not set%3C/text%3E%3C/svg%3E";
  }

  return `https://${customerCode}.cloudflarestream.com/${streamUid}/thumbnails/thumbnail.jpg`;
};

/**
 * Get the animated GIF URL for a Cloudflare Stream video
 * @param streamUid The Cloudflare Stream video UID
 * @returns The animated GIF URL
 */
export const getStreamGifUrl = (streamUid: string | null): string => {
  if (!streamUid) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%239CA3AF'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";
  }

  const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE;
  
  if (!customerCode) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='%23DC2626'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='white'%3EConfig Error%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'%3ENEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE not set%3C/text%3E%3C/svg%3E";
  }

  return `https://${customerCode}.cloudflarestream.com/${streamUid}/thumbnails/thumbnail.gif`;
};

