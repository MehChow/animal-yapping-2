import { getThumbnailUrl } from "@/lib/stream-utils";
import { formatDuration, formatRelativeTime } from "@/lib/format-utils";
import { Eye } from "lucide-react";
import { Video } from "@/types/video";
import Link from "next/link";
import Image from "next/image";

interface LatestVideoProps {
  video: Video;
}

export const LatestVideo = ({ video }: LatestVideoProps) => {
  if (!video) return null;

  return (
    <>
      {/* Title */}
      <h2 className="text-white text-2xl font-bold text-left w-full">
        Latest Video
      </h2>

      {/* Video data */}
      <div className="aspect-video w-full rounded-xl flex items-center justify-center relative">
        {/* Top full width overlay with text */}
        <div className="absolute w-full h-24 md:h-32 bg-linear-to-t from-transparent to-black/60 top-0 transition-all duration-300 z-1 pointer-events-none">
          <p className="text-white text-lg md:text-2xl font-bold pl-3 pt-3 md:pl-4 md:pt-4 transition-all duration-300">
            {video.title}
          </p>
        </div>

        {/* Thumbnail */}
        <Link
          href={`/video/${video.id}`}
          className="cursor-pointer hover:opacity-90 transition-all duration-300"
        >
          <Image
            src={getThumbnailUrl(video)}
            alt={video.title}
            fill
            className="object-cover rounded-xl"
          />
        </Link>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-xl pointer-events-none">
          <p className="text-white text-xs md:text-sm transition-all duration-300 text-center min-w-8">
            {formatDuration(video.duration)}
          </p>
        </div>
      </div>

      {/* Uploader & metadata */}
      <div className="w-full flex flex-row py-1">
        {/* Uploader icon */}
        <div className="w-10 h-10 md:w-16 md:h-16 rounded-full m-1 relative transition-all duration-300">
          <Image
            src="/default_icon.png"
            alt="Uploader"
            fill
            className="object-cover rounded-full"
          />
        </div>

        {/* Uploader name & uploaded at */}
        <div className="flex flex-col justify-center items-start px-2">
          <p className="text-white md:text-lg">{video.uploadedBy.name}</p>
          <p className="text-gray-400 text-xs md:text-sm">
            {formatRelativeTime(video.createdAt)}
          </p>
        </div>

        {/* View count */}
        <div className="flex flex-row justify-center items-start pt-1 px-2 ml-auto gap-1">
          <Eye className="text-gray-400 size-4 md:size-5 transition-all duration-300" />
          <p className="text-gray-400 text-xs md:text-sm transition-all duration-300">
            {video.viewCount}
          </p>
        </div>
      </div>
    </>
  );
};
