import { getVideoWithInteractions } from "@/app/actions/video-page";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoInfo } from "@/components/video/VideoInfo";
import { CommentSection } from "@/components/video/CommentSection";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VideoPage({ params }: Props) {
  const { id } = await params;
  const result = await getVideoWithInteractions(id);

  if (!result.success || !result.video) {
    notFound();
  }

  const { video } = result;

  return (
    <div className="h-screen bg-black text-white pt-16 overflow-hidden">
      {/* Desktop: Side-by-side, Mobile: Stacked */}
      <div className="container mx-auto px-4 py-3 h-full flex flex-col justify-center lg:flex-row lg:gap-2 transition-all duration-300">
        {/* Video container */}
        <div className="flex-col flex gap-2 lg:flex-1 lg:h-full">
          <VideoPlayer video={video} />

          <div className="flex justify-center py-2">
            <div className="w-full max-w-4xl">
              <VideoInfo video={video} />
            </div>
          </div>
        </div>

        {/* Comment section */}
        <div className="flex flex-1 w-full pt-4 lg:w-[40%] lg:flex-none lg:pt-0">
          <CommentSection videoId={video.id} />
        </div>
      </div>
    </div>
  );
}
