import EasyMasonryComponent from "@/components/shorts/Masonry-grid";
import { getLatestShorts } from "../actions/shorts";
import { Video } from "@/types/video";

export default async function ShortsPage() {
  const latestShortsResult = await getLatestShorts();
  const latestShorts = latestShortsResult.success
    ? latestShortsResult.shorts
    : [];
  const latestVideoId =
    latestShortsResult.success && latestShortsResult.latestVideoId
      ? latestShortsResult.latestVideoId
      : null;

  return (
    <div className="min-h-screen bg-black pt-32 pb-16 px-8 flex justify-center items-center flex-col gap-4">
      <div className="container h-full p-2">
        <EasyMasonryComponent
          shorts={latestShorts as Video[]}
          latestVideoId={latestVideoId}
        />
      </div>
    </div>
  );
}
