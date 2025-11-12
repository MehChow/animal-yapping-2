import Link from "next/link";
import { getLatestVideo, getLatestShorts } from "@/app/actions/home";
import { getStreamThumbnailUrl } from "@/lib/stream-utils";

export default async function Home() {
  const [latestVideoResult, latestShortsResult] = await Promise.all([
    getLatestVideo(),
    getLatestShorts(10),
  ]);

  const latestVideo = latestVideoResult.success
    ? latestVideoResult.video
    : null;
  const shorts = latestShortsResult.success ? latestShortsResult.shorts : [];

  return (
    <div className="h-screen bg-black text-white pt-16 overflow-hidden">
      <div className="container mx-auto px-4 py-6 h-full">
        <div className="flex gap-6 h-full">
          {/* Left Section: Newest Video + Trending */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Video Title */}
            {latestVideo && (
              <div className="flex flex-row gap-2">
                <p className="text-3xl font-bold text-orange-300">
                  Newest Video:
                </p>
                <p className="text-3xl font-bold">{latestVideo.title}</p>
              </div>
            )}

            {/* Newest Video */}
            {latestVideo ? (
              <Link
                href={`/video/${latestVideo.id}`}
                className="relative aspect-video bg-white/5 rounded-lg overflow-hidden group transition-colors"
              >
                <img
                  src={getStreamThumbnailUrl(latestVideo.streamUid)}
                  alt={latestVideo.title}
                  className="w-full h-full object-cover hover:brightness-110 transition-all duration-300"
                />
              </Link>
            ) : (
              <div className="aspect-video bg-white/5 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                <span className="text-white/60">No videos yet</span>
              </div>
            )}

            {/* Trending Section */}
            <div className="flex-1 flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-orange-400">
                Trendings
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-video bg-white/5 rounded-lg border border-orange-500/30 flex items-center justify-center text-white/40 text-xs hover:border-orange-500/50 transition-colors cursor-pointer"
                  >
                    Coming Soon
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section: Shorts Feed */}
          <div className="w-80 flex flex-col gap-3">
            <h2 className="text-3xl font-semibold text-blue-400 text-center">
              Shorts
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {shorts.length > 0 ? (
                shorts.map((short) => (
                  <Link
                    key={short.id}
                    href={`/video/${short.id}`}
                    className="block aspect-9/16 bg-white/5 rounded-lg border border-blue-500/30 overflow-hidden group hover:border-blue-500 transition-colors relative"
                  >
                    <img
                      src={getStreamThumbnailUrl(short.streamUid)}
                      alt={short.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-sm font-medium line-clamp-2">
                        {short.title}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        {short.viewCount.toLocaleString()} views
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="aspect-9/16 bg-white/5 rounded-lg border border-blue-500/30 flex items-center justify-center text-white/60 text-sm">
                  No shorts yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
