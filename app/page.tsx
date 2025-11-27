import { LatestShorts } from "@/components/home/LatestShorts";
import { LatestVideo } from "@/components/home/LatestVideo";
import { TrendingVideos } from "@/components/home/TrendingVideos";
import { Separator } from "@/components/ui/separator";
import {
  getLatestShorts,
  getLatestVideo,
  getTrendingVideos,
} from "@/lib/data/video";
import { Video } from "@/types/video";
import Link from "next/link";

export default async function HomePage() {
  const latestVideo = await getLatestVideo();
  const latestShorts = await getLatestShorts(10);
  const trendingVideosData = await getTrendingVideos(6);

  if (!trendingVideosData.success) {
    return (
      <div className="text-white text-center text-2xl font-bold">
        Error: {trendingVideosData.error}
      </div>
    );
  }
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
  const { trendingVideos } = trendingVideosData;

  return (
    <div className="flex flex-col min-h-dvh text-white pt-20 items-center p-4 lg:grid lg:grid-cols-10">
      {/* Newest video section*/}
      <section className="w-full flex flex-col items-center justify-center gap-2">
        <LatestVideo video={video as Video} />
      </section>

      <Separator className="w-full h-1 bg-white/10 my-4" />

      {/* Shorts section*/}
      <section className="w-full flex flex-col items-center justify-center gap-2">
        <LatestShorts shorts={shorts as Video[]} />
      </section>

      <Separator className="w-full h-1 bg-white/10 my-6" />

      {/* Trending section*/}
      <section className="w-full flex flex-col items-center justify-center gap-2">
        <TrendingVideos trendingVideos={trendingVideos as Video[]} />
      </section>
    </div>
  );
}
