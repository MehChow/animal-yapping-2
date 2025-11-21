import { TrendingGrid } from "@/components/home/TrendingGrid";
import { MobileTrendingGrid } from "@/components/home/MobileTrendingGrid";
import { CommunityFeed } from "@/components/home/CommunityFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLatestVideo } from "@/app/actions/home";
import { getStreamThumbnailUrl } from "@/lib/stream-utils";
import {
  formatDuration,
  formatViewCount,
  formatRelativeTime,
} from "@/lib/format-utils";
import Link from "next/link";
import { LatestVideo } from "@/components/home/LatestVideo";
import { Video } from "@/types/video";
import { getLatestShorts } from "./actions/shorts";
import { LatestShorts } from "@/components/home/LatestShorts";

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
      <div className="hidden md:block h-screen bg-black text-white pt-16 overflow-hidden">
        <div className="container mx-auto p-4 h-full transition-all duration-300">
          <div className="flex gap-6 h-full transition-all duration-300">
            {/* Left Section: Trending (1 units) */}
            <div className="flex-2 flex flex-col">
              {/* Trending Grid with Virtualization */}
              <TrendingGrid />
            </div>

            {/* Middle Section: Newest Video (5 units) */}
            <div className="flex-4 flex flex-col gap-4">
              <LatestVideo latestVideo={latestVideo as Video} />
              <LatestShorts shorts={latestShorts as Video[]} />
            </div>

            {/* Right Section: Community Feed (4 units) */}
            <div className="flex-4 flex flex-col">
              <CommunityFeed />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden h-screen bg-black text-white pt-16 overflow-hidden">
        <Tabs defaultValue="video" className="h-full flex flex-col">
          {/* Sticky Tab Navigation */}
          <div className="sticky top-16 z-10 bg-black border-b border-gray-800">
            <TabsList className="w-full grid grid-cols-2 bg-gray-900/50 rounded-none h-12">
              <TabsTrigger value="video" className="text-base">
                Video
              </TabsTrigger>
              <TabsTrigger value="community" className="text-base">
                Community
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Video Tab */}
          <TabsContent value="video" className="flex-1 overflow-hidden m-0">
            <div className="h-full flex flex-col">
              {/* Newest Video (Sticky Section) */}
              <div className="px-4 pt-6 pb-2 space-y-2">
                {latestVideo ? (
                  <>
                    <div className="flex flex-row gap-2 items-baseline">
                      <p className="text-lg font-bold text-green-400">
                        Newest video:
                      </p>
                      <Link
                        href={`/video/${latestVideo.id}`}
                        className="text-base font-medium text-white hover:text-green-400 transition-colors truncate flex-1"
                      >
                        {latestVideo.title}
                      </Link>
                    </div>

                    {/* Newest Video with Gradient Border */}
                    <Link href={`/video/${latestVideo.id}`}>
                      <div className="dark-gradient rounded-lg p-[3px]">
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer">
                          <img
                            src={getStreamThumbnailUrl(latestVideo.streamUid)}
                            alt={latestVideo.title}
                            className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300 relative z-10"
                          />
                          <div className="absolute bottom-2 right-2 z-20 bg-black/80 px-2 py-1 rounded text-xs text-white">
                            {formatDuration(latestVideo.duration)}
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>
                        {formatViewCount(latestVideo.viewCount)} views
                      </span>
                      <span>•</span>
                      <span>{formatRelativeTime(latestVideo.createdAt)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-row gap-2 items-baseline">
                      <p className="text-lg font-bold text-green-400">
                        Newest video:
                      </p>
                      <p className="text-base font-medium text-white/60">
                        No videos yet
                      </p>
                    </div>
                    <div className="aspect-video bg-white/5 rounded-lg border-2 border-gray-700 flex items-center justify-center">
                      <span className="text-white/40 text-sm">
                        No videos uploaded yet
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Trending Section with Infinity Scroll */}
              <div className="flex-1 px-4 pb-4 overflow-hidden">
                <MobileTrendingGrid />
              </div>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="flex-1 overflow-hidden m-0">
            <div className="h-full px-4 pt-6 pb-4">
              <CommunityFeed />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
