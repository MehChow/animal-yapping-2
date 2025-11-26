import { LatestShorts } from "@/components/home/LatestShorts";
import { LatestVideo } from "@/components/home/LatestVideo";
import { getLatestShorts, getLatestVideo } from "@/lib/data/video";
import { Video } from "@/types/video";

export default async function HomePage() {
  const latestVideo = await getLatestVideo();
  const latestShorts = await getLatestShorts(10);

  if (!latestVideo.success) {
    return (
      <div className="text-white text-center text-2xl font-bold">
        Error: {latestVideo.error}
      </div>
    );
  }

  if (!latestShorts.success) {
    return (
      <div className="text-white text-center text-2xl font-bold">
        Error: {latestShorts.error}
      </div>
    );
  }

  const { shorts } = latestShorts;
  const { video } = latestVideo;

  return (
    <div className="flex flex-col h-dvh bg-black text-white pt-18 items-center gap-8 p-4 lg:grid lg:grid-cols-10">
      {/* Newest video section*/}
      <section className="w-full flex flex-col items-center justify-center">
        <LatestVideo video={video as Video} />
      </section>

      {/* Shorts section*/}
      <section className="w-full flex flex-col items-center justify-center">
        <LatestShorts shorts={shorts as Video[]} />
      </section>
    </div>
  );
}
