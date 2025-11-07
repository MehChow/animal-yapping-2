/**
 * Client-side thumbnail generation utilities
 * Generates thumbnails from video File without uploading
 */

export type ThumbnailData = {
  id: string;
  data: string; // base64 data URL
  timestamp: number;
};

/**
 * Generate thumbnails from a video file on the client side
 */
export const generateClientThumbnails = async (
  videoFile: File,
  count: number = 3
): Promise<ThumbnailData[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        // Set canvas size based on video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const thumbnails: ThumbnailData[] = [];
        const timestamps = generateRandomTimestamps(duration, count);

        for (let i = 0; i < timestamps.length; i++) {
          const timestamp = timestamps[i];

          // Seek to timestamp
          await seekToTime(video, timestamp);

          // Draw frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert to base64
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

          thumbnails.push({
            id: `thumbnail-${i}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
            data: dataUrl,
            timestamp: Math.round(timestamp),
          });
        }

        // Cleanup
        URL.revokeObjectURL(video.src);
        resolve(thumbnails);
      } catch (error) {
        URL.revokeObjectURL(video.src);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video"));
    };

    video.src = URL.createObjectURL(videoFile);
  });
};

/**
 * Seek video to specific time
 */
const seekToTime = (video: HTMLVideoElement, time: number): Promise<void> => {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = time;
  });
};

/**
 * Generate random timestamps for thumbnail capture
 */
const generateRandomTimestamps = (
  duration: number,
  count: number
): number[] => {
  const timestamps: number[] = [];
  const minTime = Math.min(2, duration * 0.1); // Start after 2s or 10% of video
  const maxTime = duration * 0.9; // End at 90% of video

  for (let i = 0; i < count; i++) {
    const randomTime = minTime + Math.random() * (maxTime - minTime);
    timestamps.push(randomTime);
  }

  return timestamps.sort((a, b) => a - b);
};

/**
 * Convert base64 data URL to Blob
 */
export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};

