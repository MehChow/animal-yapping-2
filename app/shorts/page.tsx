import { notFound } from "next/navigation";
import { getVideoWithInteractions } from "../actions/video-page";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ShortsPage({ params }: Props) {
  const { id } = await params;
  const result = await getVideoWithInteractions(id);

  if (!result.success || !result.video) {
    notFound();
  }

  const { video } = result;

  return (
    <div className="min-h-screen bg-black pt-32 pb-16 px-8 flex items-center flex-col gap-4">
      <div className="container h-full p-2"></div>
    </div>
  );
}
