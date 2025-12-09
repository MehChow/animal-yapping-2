import { getThumbnailUrl } from "@/lib/stream-utils";
import { formatDuration, formatRelativeTime } from "@/lib/format-utils";
import { Eye } from "lucide-react";
import { Video } from "@/types/video";
import Link from "next/link";
import Image from "next/image";
import { UserAvatar } from "@/components/ui/user-avatar";

interface LatestVideoProps {
  video: Video;
}

export const LatestVideo = ({ video }: LatestVideoProps) => {
  if (!video) return null;

  return (
    <>
      {/* Title */}
      <h2
        className="text-green-300 text-[5vw] font-bold text-center w-full 
                md:text-[clamp(1rem,2.5vw,32px)] md:text-left"
      >
        ✨Latest Video
      </h2>

      {/* Video data */}
      <div className="aspect-video w-full rounded-xl flex items-center justify-center relative dark-gradient p-1">
        {/* Thumbnail */}
        <div className="gradient-content w-full h-full relative">
          {/* Top full width overlay with text */}
          <div className="absolute w-full h-24 rounded-t-xl bg-linear-to-t from-transparent to-black/60 top-0 transition-all duration-300 z-10 pointer-events-none">
            <p className="text-white text-[3vw] font-bold pl-4 pt-3 transition-all duration-300 md:text-[clamp(1rem,2vw,1.5rem)]">
              {video.title}
            </p>
          </div>

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
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-xl pointer-events-none">
          <p className="text-white text-xs transition-all duration-300 text-center min-w-8">
            {formatDuration(video.duration)}
          </p>
        </div>
      </div>

      {/* Uploader & metadata */}
      <div className="w-full flex flex-row py-1">
        <UserAvatar
          name={video.uploadedBy.name}
          imageKey={video.uploadedBy.image}
          sizeClass="size-10"
          className="m-1 transition-all duration-300"
          imageSizes="40px"
        />

        {/* Uploader name & uploaded at */}
        <div className="flex flex-col justify-center items-start px-2">
          <p className="text-white text-lg">{video.uploadedBy.name}</p>
          <p className="text-gray-400 text-xs">
            {formatRelativeTime(video.createdAt)}
          </p>
        </div>

        {/* View count */}
        <div className="flex flex-row justify-center items-start pt-1 px-2 ml-auto gap-1">
          <Eye className="text-gray-400 size-4 transition-all duration-300" />
          <p className="text-gray-400 text-xs transition-all duration-300">
            {video.viewCount}
          </p>
        </div>
      </div>
    </>
  );
};
