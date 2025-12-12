import { DeleteButton } from "@/components/admin/manage-video/delete-button";
import { EditButton } from "@/components/admin/manage-video/edit-button";
import { ManageVideoSort } from "@/components/admin/manage-video/sort-select";
import { ManageVideoTabs } from "@/components/admin/manage-video/video-tabs";
import { Separator } from "@/components/ui/separator";
import { getVideos } from "@/lib/data/video";
import { getThumbnailUrl } from "@/lib/stream-utils";
import { Video } from "@/types/video";
import {
  DEFAULT_VIDEO_SORT,
  isVideoSortValue,
  VideoSortValue,
} from "@/types/video-sort";
import { VideoThumbnail } from "@/components/admin/manage-video/video-thumbnail";
import { isVideoTypeValue, VideoType } from "@/utils/video-utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatDate } from "@/lib/format-utils";

type ManageVideoPageProps = {
  searchParams: Promise<{
    sort?: string;
    type?: string;
  }>;
};

const parseSortParam = (value?: string): VideoSortValue =>
  isVideoSortValue(value) ? value : DEFAULT_VIDEO_SORT;

const parseTypeParam = (value?: string): VideoType =>
  isVideoTypeValue(value) ? value : "Normal";

export default async function ManageVideoPage({
  searchParams,
}: ManageVideoPageProps) {
  const resolvedSearchParams = await searchParams;
  const sort = parseSortParam(resolvedSearchParams?.sort);
  const type = parseTypeParam(resolvedSearchParams?.type);
  const videos = await getVideos(10, type, sort);

  if (!videos.success) {
    return (
      <div className="text-white text-center text-2xl font-bold">
        Error: {videos.error}
      </div>
    );
  }
  const { videos: videosData } = videos;

  return (
    <div className="min-h-screen container mx-auto pt-32 px-8 transition-all duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Title */}
        <h1 className="text-4xl font-bold text-white">Manage Video</h1>
      </div>

      <div className="mb-6 flex flex-row justify-between items-center">
        <ManageVideoTabs initialType={type} />
        <ManageVideoSort initialValue={sort} />
      </div>

      <div className="flex flex-col">
        {videosData?.map((video, index) => {
          const isLast = index === videosData.length - 1;

          return (
            <div key={video.id}>
              <VideoCard video={video as Video} />
              {/* Conditionally render the Separator */}
              {!isLast && <Separator className="w-full h-1 bg-white/10 my-4" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const VideoCard = ({ video }: { video: Video }) => {
  const [formattedDate, formattedTime] = formatDate(video.createdAt);

  return (
    <div className="rounded-md border-0 shadow-lg backdrop-blur-sm transition-colors flex-row flex p-2 hover:bg-white/5">
      {/* Thumbnail */}
      <VideoThumbnail src={getThumbnailUrl(video)} alt={video.title} />

      <div className="flex min-w-0 flex-1 flex-col px-2">
        {/* Title */}
        <h2 className="text-white text-lg font-bold line-clamp-1">
          {video.title}
        </h2>

        {/* Uploaded by */}
        <div className="flex flex-row items-center gap-2 mt-1 min-w-0">
          <UserAvatar
            name={video.uploadedBy.name}
            imageKey={video.uploadedBy.image}
            sizeClass="size-6"
            imageSizes="32px"
          />
          <p className="text-white/50 text-sm">{video.uploadedBy.name}</p>

          <Separator orientation="vertical" className="h-4 bg-white/20" />

          <p className="text-white/50 text-sm">{formattedDate}</p>

          <Separator orientation="vertical" className="h-4 bg-white/20" />

          <p className="text-white/50 text-sm truncate">{formattedTime}</p>
        </div>
      </div>

      <div className="flex flex-row gap-1 items-end">
        <EditButton videoId={video.id} />
        <DeleteButton videoId={video.id} />
      </div>
    </div>
  );
};
