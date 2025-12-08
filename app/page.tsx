import { CommunityFeed } from "@/components/home/CommunityFeed";
import { LatestShorts } from "@/components/home/LatestShorts";
import { LatestVideo } from "@/components/home/LatestVideo";
import { SectionNavigation } from "@/components/home/SectionNavigation";
import { TrendingVideos } from "@/components/home/TrendingVideos";
import { Separator } from "@/components/ui/separator";
import {
  getLatestShorts,
  getLatestVideo,
  getTrendingVideos,
} from "@/lib/data/video";
import { Video } from "@/types/video";

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
    <>
      {/* Section Navigation - appears after scrolling 1/3 of page */}
      <SectionNavigation />

      <div
        className="flex flex-col min-h-dvh max-w-7xl mx-auto text-white pt-20 items-center p-4 
               md:grid md:grid-cols-10 md:gap-4 md:items-start md:h-dvh"
      >
        {/* -------------------- LEFT SIDE WRAPPER (6/10) -------------------- */}
        <div className="md:col-span-6 w-full flex flex-col md:h-full">
          {/* Newest video section*/}
          <section
            id="newest-video"
            className="w-full flex flex-col items-center justify-center gap-2 scroll-mt-20"
          >
            <LatestVideo video={video as Video} />
          </section>

          {/* The Separator is only for mobile and will appear between the left/right blocks on mobile */}
          <Separator className="w-full h-1 bg-white/10 my-4" />

          {/* Shorts section*/}
          <section
            id="shorts"
            className="w-full flex flex-col items-center justify-center gap-2 scroll-mt-20"
          >
            <LatestShorts shorts={shorts as Video[]} />
          </section>

          <Separator className="w-full h-1 bg-white/10 my-4" />

          {/* Trending section*/}
          <section
            id="trending"
            className="w-full flex flex-col items-center justify-center gap-2 scroll-mt-20"
          >
            <TrendingVideos trendingVideos={trendingVideos as Video[]} />
          </section>
        </div>
        {/* ------------------ END LEFT SIDE WRAPPER ------------------ */}

        {/* The next Separator will only appear on mobile, separating the trending and community sections */}
        <Separator className="w-full h-1 bg-white/10 my-6 md:hidden" />

        {/* -------------------- RIGHT SIDE SECTION (4/10) -------------------- */}
        {/* Community section*/}
        <section
          id="posts"
          className="w-full flex flex-col items-center justify-start gap-2 scroll-mt-20 
                 md:col-span-4 md:h-full md:overflow-y-auto" // Assigns 4 columns on medium screens
        >
          <CommunityFeed />
        </section>
        {/* ------------------ END RIGHT SIDE SECTION ------------------ */}
      </div>
    </>
  );
}
