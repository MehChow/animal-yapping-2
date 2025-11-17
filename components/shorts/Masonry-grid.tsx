"use client";

import { getStreamThumbnailUrl } from "@/lib/stream-utils";
import { Video } from "@/types/video";
import { MasonryProps } from "masonic";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ComponentType, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatViewCount } from "@/lib/format-utils";

const Masonry: ComponentType<MasonryProps<Video>> = dynamic(
  () => import("masonic").then((mod) => mod.Masonry),
  { ssr: false }
);

type EasyMasonryComponentProps = {
  shorts: Video[];
  latestVideoId: string | null;
};

const EasyMasonryComponent = ({
  shorts,
  latestVideoId,
}: EasyMasonryComponentProps) => (
  <Masonry
    items={shorts}
    render={(props) => <MasonryCard {...props} latestVideoId={latestVideoId} />}
    columnGutter={16}
    rowGutter={16}
    columnWidth={240}
  />
);

const MasonryCard = ({
  index,
  data,
  latestVideoId,
}: {
  index: number;
  data: Video;
  latestVideoId: string | null;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // The video with latestVideoId gets the gradient border when fully loaded
  const isLatestVideo = data.id === latestVideoId;
  const showGradientBorder = isLatestVideo && !isLoading && !hasError;

  return (
    <div className="relative">
      {showGradientBorder ? (
        // Latest video with gradient border around entire card
        <Link href={`/video/${data.id}`} className="block -m-[3px]">
          <div className="dark-gradient rounded-2xl p-[3px] transition-all duration-300">
            <div className="bg-black rounded-2xl p-3 transition-all duration-300 hover:bg-gray-900 relative z-10">
              {/* Thumbnail Container */}
              <div className="relative mb-3">
                <div className="bg-gray-800 rounded-2xl aspect-9/16 transition-colors relative overflow-hidden">
                  <ThumbnailContent
                    data={data}
                    isLoading={isLoading}
                    hasError={hasError}
                    onLoadingComplete={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setHasError(true);
                    }}
                  />
                </div>
              </div>

              {/* Metadata Section */}
              <div className="space-y-2">
                {/* Title */}
                <h3 className="text-white font-medium text-sm leading-tight line-clamp-2">
                  {data.title}
                </h3>

                {/* View Count */}
                <p className="text-gray-400 text-xs">
                  {formatViewCount(data.viewCount)} views
                </p>

                {/* Tags */}
                {data.tags && data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {data.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="secondary"
                        className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {data.tags.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-400 border-gray-500/30"
                      >
                        +{data.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      ) : (
        // Regular videos without gradient border
        <Link href={`/video/${data.id}`} className="block">
          <div className="bg-white/5 rounded-2xl p-3 transition-all duration-300 hover:bg-white/10">
            {/* Thumbnail Container */}
            <div className="relative mb-3">
              <div className="bg-gray-800 rounded-2xl aspect-9/16 transition-colors relative overflow-hidden">
                <ThumbnailContent
                  data={data}
                  isLoading={isLoading}
                  hasError={hasError}
                  onLoadingComplete={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                  }}
                />
              </div>
            </div>

            {/* Metadata Section */}
            <div className="space-y-2">
              {/* Title */}
              <h3 className="text-white font-medium text-sm leading-tight line-clamp-2 hover:text-purple-300 transition-colors">
                {data.title}
              </h3>

              {/* View Count */}
              <p className="text-gray-400 text-xs">
                {formatViewCount(data.viewCount)} views
              </p>

              {/* Tags */}
              {data.tags && data.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {data.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Badge
                      key={tagIndex}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {data.tags.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-400 border-gray-500/30"
                    >
                      +{data.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

// Extracted thumbnail content component for reusability
const ThumbnailContent = ({
  data,
  isLoading,
  hasError,
  onLoadingComplete,
  onError,
}: {
  data: Video;
  isLoading: boolean;
  hasError: boolean;
  onLoadingComplete: () => void;
  onError: () => void;
}) => (
  <>
    {/* Loading Skeleton */}
    {isLoading && !hasError && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-2xl" />
      </div>
    )}

    {/* Error State */}
    {hasError && (
      <div className="absolute inset-0 bg-gray-700 flex items-center justify-center rounded-2xl">
        <div className="text-gray-400 text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-xs">Failed to load</div>
        </div>
      </div>
    )}

    {/* Actual Image */}
    {!hasError && (
      <Image
        src={getStreamThumbnailUrl(data.streamUid)}
        alt={data.title}
        fill
        className={`object-cover transition-opacity duration-300 rounded-2xl z-10 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoadingComplete={onLoadingComplete}
        onError={onError}
      />
    )}
  </>
);

export default EasyMasonryComponent;
