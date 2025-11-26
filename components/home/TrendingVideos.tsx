import { getThumbnailUrl } from "@/lib/stream-utils";
import { Video } from "@/types/video";
import Image from "next/image";

interface TrendingVideosProps {
  trendingVideos: Video[];
}

export const TrendingVideos = ({ trendingVideos }: TrendingVideosProps) => {
  if (!trendingVideos || trendingVideos.length === 0) return null;

  return (
    <>
      {/* Title */}
      <h2 className="text-white text-2xl font-bold text-left w-full">
        🔥Trending
      </h2>

      <div className="grid grid-cols-3 gap-2 w-full">
        {trendingVideos.map((video) => (
          <div
            key={video.id}
            className="aspect-video relative rounded-lg border-0 overflow-hidden flex items-center justify-center cursor-pointer"
          >
            <Image
              src={getThumbnailUrl(video)}
              alt={video.title}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </>
  );
};
