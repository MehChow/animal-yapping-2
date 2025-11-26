import { LatestVideo } from "@/components/home/LatestVideo";
import { getLatestVideo } from "@/lib/data/video";
import { Video } from "@/types/video";

export default async function HomePage() {
  const latestVideo = await getLatestVideo();

  if (!latestVideo.success) {
    return (
      <div className="text-white text-center text-2xl font-bold">
        Error: {latestVideo.error}
      </div>
    );
  }

  const { video } = latestVideo;
  if (!video) {
    return <div>No video found</div>;
  }

  return (
    <div className="flex flex-col h-dvh bg-black text-white pt-19 items-center p-3 lg:grid lg:grid-cols-10">
      {/* Newest video section*/}
      <section className="w-full flex flex-col items-center justify-center">
        <LatestVideo video={video as Video} />
      </section>
    </div>
  );
}
