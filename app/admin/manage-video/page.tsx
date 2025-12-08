import { DeleteButton } from "@/components/admin/manage-video/delete-button";
import { EditButton } from "@/components/admin/manage-video/edit-button";
import { getVideos } from "@/lib/data/video";
import { getThumbnailUrl } from "@/lib/stream-utils";
import { Video } from "@/types/video";
import { getUserIconUrl } from "@/utils/user-utils";
import Image from "next/image";

export default async function ManageVideoPage() {
  const videos = await getVideos(10);
  if (!videos.success) {
    return (
      <div className="text-white text-center text-2xl font-bold">
        Error: {videos.error}
      </div>
    );
  }
  const { videos: videosData } = videos;

  return (
    <div className="min-h-screen pt-32 px-8">
      {/* Title */}
      <h1 className="text-4xl font-bold text-white mb-8">Manage Video</h1>

      <div className="flex flex-col gap-4">
        {videosData?.map((video) => {
          return <VideoCard key={video.id} video={video as Video} />;
        })}
      </div>
    </div>
  );
}

const VideoCard = ({ video }: { video: Video }) => {
  return (
    <div className="bg-white/5 rounded-md border-0 shadow-lg backdrop-blur-sm transition-colors flex-row flex p-1">
      {/* Thumbnail */}
      <div className="relative aspect-video h-20">
        <Image
          src={getThumbnailUrl(video)}
          alt={video.title}
          fill
          className="object-cover rounded-md"
        />
      </div>

      <div className="flex flex-col flex-1 px-2">
        {/* Title */}
        <h2 className="text-white text-lg font-bold line-clamp-1">
          {video.title}
        </h2>

        {/* Uploaded by */}
        <div className="flex flex-row items-center gap-2 mt-1">
          <div className="relative size-6 rounded-full">
            <Image
              src={getUserIconUrl(video.uploadedBy.image)}
              alt={video.uploadedBy.name}
              fill
              className="rounded-full"
            />
          </div>
          <p className="text-white/50 text-sm">{video.uploadedBy.name}</p>
        </div>
      </div>

      <div className="flex flex-row gap-1 items-end">
        <EditButton />
        <DeleteButton />
      </div>
    </div>
  );
};
