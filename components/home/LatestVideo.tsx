import { getStreamThumbnailUrl } from "@/lib/stream-utils";
import { formatDuration } from "@/lib/format-utils";
import { formatViewCount } from "@/lib/format-utils";
import { formatRelativeTime } from "@/lib/format-utils";
import Link from "next/link";
import { Video } from "@/types/video";
import Image from "next/image";

interface LatestVideoProps {
  latestVideo: Video;
}

export const LatestVideo = ({ latestVideo }: LatestVideoProps) => {
  return (
    <div>
      {/* Newest Video with Gradient Border */}
      <Link href={`/video/${latestVideo.id}`} className="group">
        <div className="dark-gradient rounded-lg p-[3px] transition-all duration-300">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer transition-all duration-300">
            <Image
              src={getStreamThumbnailUrl(latestVideo.streamUid)}
              alt={latestVideo.title}
              fill
              className="object-cover group-hover:brightness-110 transition-all duration-300 relative z-10"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 z-20">
              <p className="text-white font-medium truncate w-full pb-2 pl-2">
                {latestVideo.title}
              </p>
            </div>

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
