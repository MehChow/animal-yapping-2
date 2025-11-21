import { getStreamThumbnailUrl } from "@/lib/stream-utils";
import { formatDuration } from "@/lib/format-utils";
import { formatViewCount } from "@/lib/format-utils";
import { formatRelativeTime } from "@/lib/format-utils";
import Link from "next/link";
import { Video } from "@/types/video";

interface LatestVideoProps {
  latestVideo: Video;
}

export const LatestVideo = ({ latestVideo }: LatestVideoProps) => {
  return (
    <div className="">
      {/* Video Title */}
      <h2 className="text-2xl font-semibold text-center text-green-300 pb-4">
        Newest video
      </h2>

      {/* Newest Video with Gradient Border */}
      <Link href={`/video/${latestVideo.id}`}>
        <div className="dark-gradient rounded-lg p-[3px] transition-all duration-300">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer transition-all duration-300">
            <img
              src={getStreamThumbnailUrl(latestVideo.streamUid)}
              alt={latestVideo.title}
              className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300 relative z-10"
            />
            <div className="absolute bottom-3 right-3 z-20 bg-black/80 px-2 py-1 rounded text-xs text-white">
              {formatDuration(latestVideo.duration)}
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
        <span>{formatViewCount(latestVideo.viewCount)} views</span>
        <span>•</span>
        <span>{formatRelativeTime(latestVideo.createdAt)}</span>
      </div>
    </div>
  );
};
