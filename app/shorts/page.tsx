import MasonryComponent from "@/components/shorts/Masonry-grid";
import { getLatestShorts } from "../actions/shorts";
import { Video } from "@/types/video";

export default async function ShortsPage() {
  const data = await getLatestShorts();
  const latestShorts = data.success ? data.shorts : [];

  return (
    <div className="min-h-screen bg-black pt-32 pb-16 px-8 flex items-center flex-col gap-4">
      <div className="container h-full p-2">
        <MasonryComponent shorts={latestShorts as Video[]} />
      </div>
    </div>
  );
}
