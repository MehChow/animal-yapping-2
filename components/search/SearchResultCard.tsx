import { formatDuration, formatRelativeTime, formatViewCount } from "@/lib/format-utils";
import { getThumbnailUrl } from "@/lib/stream-utils";
import { Video } from "@/types/video";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type SearchResultCardProps = {
  video: Video;
};

export const SearchResultCard = ({ video }: SearchResultCardProps) => {
  return (
    <Link
      href={`/video/${video.id}`}
      className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl hover:bg-zinc-800/50 
                 transition-all duration-300 group"
      tabIndex={0}
      aria-label={`Watch ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full sm:w-80 md:w-96 shrink-0 rounded-xl overflow-hidden">
        <Image
          src={getThumbnailUrl(video)}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, 384px"
        />

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded-md">
          <span className="text-white text-xs font-medium">
            {formatDuration(video.duration)}
          </span>
        </div>
      </div>

      {/* Video Info */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {/* Title */}
        <h3 className="text-white font-semibold text-base md:text-lg line-clamp-2 group-hover:text-purple-300 transition-colors">
          {video.title}
        </h3>

        {/* Stats Row */}
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{formatViewCount(video.viewCount)} views</span>
          </div>
          <span>•</span>
          <span>{formatRelativeTime(video.createdAt)}</span>
        </div>

        {/* Uploader Info */}
        <div className="flex items-center gap-2 mt-1">
          <UserAvatar
            name={video.uploadedBy.name}
            imageKey={video.uploadedBy.image}
            sizeClass="w-6 h-6"
            imageSizes="24px"
          />
          <span className="text-zinc-400 text-sm hover:text-white transition-colors">
            {video.uploadedBy.name}
          </span>
        </div>

        {/* Description Preview */}
        {video.description && (
          <p className="text-zinc-500 text-sm line-clamp-2 mt-1 hidden md:block">
            {video.description}
          </p>
        )}

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {video.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

