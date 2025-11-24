import { TrendingGrid } from "@/components/home/TrendingGrid";
import { CommunityFeed } from "@/components/home/CommunityFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLatestVideo } from "@/app/actions/home";
import { LatestVideo } from "@/components/home/LatestVideo";
import { Video } from "@/types/video";
import { getLatestShorts } from "./actions/shorts";
import { LatestShorts } from "@/components/home/LatestShorts";
import { Separator } from "@radix-ui/react-separator";

export default async function HomePage() {
  const latestVideoResult = await getLatestVideo();
  const latestVideo = latestVideoResult.success
    ? latestVideoResult.video
    : null;

  const latestShortsResult = await getLatestShorts();
  const latestShorts = latestShortsResult.success
    ? latestShortsResult.shorts
    : null;

  return (
    <>
      {/* Desktop View */}
      <div className="block h-screen bg-black text-white pt-16 overflow-hidden">
        <div className="lg:container mx-auto p-4 h-full transition-all duration-300">
          <div className="flex gap-6 h-full transition-all duration-300">
            {/* Left Section: Trending (1 units) */}
            <div className="flex-2 flex flex-col">
              <h2 className="text-2xl font-semibold text-orange-400 text-center mb-4">
                🔥Trendings
              </h2>
              <TrendingGrid />
            </div>

            {/* Middle Section: Newest Video + Shorts (5 units) */}
            <div className="flex-4 flex flex-col gap-4">
              {/* Video*/}
              <h2 className="text-2xl font-semibold text-center text-green-300">
                Newest
              </h2>
              <LatestVideo latestVideo={latestVideo as Video} />

              {/* Shorts */}
              <p className="text-2xl font-semibold text-purple-300 text-center">
                Shorts
              </p>
              <LatestShorts shorts={latestShorts as Video[]} />
            </div>

            {/* Right Section: Community Feed (4 units) */}
            <div className="flex-4 flex-col hidden lg:flex">
              <h2 className="text-2xl font-semibold text-blue-400 text-center mb-4">
                💬Bullsheet
              </h2>
              <CommunityFeed />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
