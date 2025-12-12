import { requireRole } from "@/lib/auth-utils";
import { getVideoById } from "@/lib/data/video";
import { EditVideoPageClient } from "@/components/admin/manage-video/edit/edit-video-page-client";
import { notFound } from "next/navigation";
import { ThumbnailSource } from "@/types/thumbnail";

type EditVideoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  // Protect this page - only Admin can access
  await requireRole(["Admin"]);

  const { id } = await params;
  const result = await getVideoById(id);

  if (!result.success || !result.video) {
    notFound();
  }

  const { video } = result;

  const initialData = {
    title: video.title,
    description: video.description || undefined,
    tags: video.tags,
    gameType: video.gameType,
    videoType: video.videoType as "Normal" | "Shorts",
    streamUid: video.streamUid,
    videoDuration: video.duration || 0,
    thumbnailSource: video.thumbnailSource as ThumbnailSource,
    thumbnailTimestamp: video.thumbnailTimestamp,
    customThumbnailKey: video.customThumbnailKey,
  };

  return (
    <div className="min-h-screen container mx-auto pt-32 px-8 transition-all duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-4xl font-bold text-white">Edit Video</h1>
      </div>

      <EditVideoPageClient videoId={video.id} initialData={initialData} />
    </div>
  );
}
