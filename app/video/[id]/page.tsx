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
  const isNormal = video.videoType === "Normal";

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
      <div className="container mx-auto px-4 py-3 h-full flex flex-col lg:flex-row lg:gap-2 transition-all duration-300">
        {/* Video container */}
        <div
          className={`flex-col flex gap-2 ${isNormal ? "flex-1" : "h-[60%]"}`}
        >
          <div className={`justify-center ${isNormal ? "" : "h-[80%] flex"}`}>
            <VideoPlayer video={video} />
          </div>

          <div className="flex justify-center py-2">
            <div className="w-full max-w-4xl">
              <VideoInfo video={video} />
            </div>
          </div>
        </div>

        {/* Comment section */}
        <div className="flex min-h-0 w-full">
          <CommentSection videoId={video.id} />
        </div>
      </div>
    </div>
  );
}
