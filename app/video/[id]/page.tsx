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

  if (!video.streamUid) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video Not Available</h1>
          <p className="text-white/60">
            This video is still processing or unavailable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white pt-16 overflow-hidden">
      {/* Desktop: Side-by-side, Mobile: Stacked */}
      <div className="container mx-auto px-4 py-3 h-full">
        <div className="flex flex-col lg:flex-row gap-3 h-full">
          {/* Left Column: Video Player + Info */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <VideoPlayer video={video} />
            <VideoInfo video={video} />
          </div>

          {/* Right Column: Comment Section */}
          <div className="lg:w-96 xl:w-[28rem] h-full">
            <CommentSection videoId={video.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
