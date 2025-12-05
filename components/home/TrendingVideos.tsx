import { formatDuration, formatRelativeTime } from "@/lib/format-utils";
import { getThumbnailUrl } from "@/lib/stream-utils";
import { Video } from "@/types/video";
import { getUserIconUrl } from "@/utils/user-utils";
import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TrendingVideosProps {
  trendingVideos: Video[];
}

export const TrendingVideos = ({ trendingVideos }: TrendingVideosProps) => {
  if (!trendingVideos || trendingVideos.length === 0) return null;

  return (
    <>
      {/* Title */}
      <h2 className="text-orange-300 text-[5vw] font-bold text-center w-full">
        🔥Trending
      </h2>

      <div className="grid grid-cols-3 w-full space-y-2">
        {trendingVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      <Link
        href="/explore"
        className="w-full h-10 flex items-center justify-center rounded-xl text-white/30 
              text-sm font-bold text-center hover:bg-white/5 transition-all duration-300"
      >
        See more
      </Link>
    </>
  );
};

const VideoCard = ({ video }: { video: Video }) => {
  return (
    <Link
      href={`/video/${video.id}`}
      className="flex flex-col gap-2 hover:bg-white/10 hover:opacity-90 rounded-xl p-1 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div
        className="aspect-video relative rounded-lg border-0 overflow-hidden flex items-center 
              justify-center cursor-pointer"
      >
        <Image
          src={getThumbnailUrl(video)}
          alt={video.title}
          fill
          className="object-cover"
        />

        {/* Duration */}
        <div className="absolute bottom-1 right-1 p-1 bg-black/50 rounded-md pointer-events-none">
          <p className="text-white text-xs md:text-sm transition-all duration-300 text-center min-w-8">
            {formatDuration(video.duration)}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-row gap-2 pointer-events-none">
        {/* Uploader icon */}
        <div className="w-6 h-6 rounded-full relative overflow-hidden shrink-0">
          <Image
            src={getUserIconUrl(video.uploadedBy.image)}
            alt={video.uploadedBy.name || "Anonymous"}
            fill
            className="rounded-full"
          />
        </div>

        {/* Title & uploaded at */}
        <div className="flex flex-col gap-1 flex-1 min-w-0 transition-all duration-300">
          <p
            className="text-white font-bold text-left line-clamp-2"
            style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}
          >
            {video.title}
          </p>

          <div className="flex flex-row gap-1 justify-between">
            <p
              className="text-gray-400 transition-all duration-300"
              style={{ fontSize: "clamp(0.625rem, 2vw, 0.75rem)" }}
            >
              {formatRelativeTime(video.createdAt)}
            </p>

            {/* View count */}
            <div className="flex flex-row justify-center items-center gap-1 shrink-0">
              <Eye
                className="text-gray-400 transition-all duration-300"
                style={{
                  width: "clamp(0.625rem, 1.5vw, 0.75rem)",
                  height: "clamp(0.625rem, 1.5vw, 0.75rem)",
                }}
              />
              <p
                className="text-gray-400 transition-all duration-300"
                style={{ fontSize: "clamp(0.625rem, 2vw, 0.75rem)" }}
              >
                {video.viewCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
