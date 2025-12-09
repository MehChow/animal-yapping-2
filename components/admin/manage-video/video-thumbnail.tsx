"use client";

import Image from "next/image";
import { useThumbnailLoading } from "@/hooks/useThumbnailLoading";

type VideoThumbnailProps = {
  src: string;
  alt: string;
};

export const VideoThumbnail = ({ src, alt }: VideoThumbnailProps) => {
  const { isLoaded, handleLoad } = useThumbnailLoading();

  return (
    <div
      className="relative aspect-video h-20 overflow-hidden rounded-md"
      aria-busy={!isLoaded}
      aria-label={alt}
    >
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-white/5"
          role="status"
          aria-live="polite"
          aria-label="Loading thumbnail"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain rounded-md transition-opacity duration-200"
        onLoadingComplete={handleLoad}
        priority={false}
      />
    </div>
  );
};
