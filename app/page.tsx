import { getLatestVideo } from "@/lib/data/video";
import { Eye } from "lucide-react";
import Image from "next/image";

export default async function HomePage() {
  const latestVideo = await getLatestVideo();

  if (!latestVideo.success) {
    return <div>Error: {latestVideo.error}</div>;
  }

  const { video } = latestVideo;
  console.log(video);

  return (
    <div className="flex flex-col h-dvh bg-black text-white pt-18 items-center p-3 lg:grid lg:grid-cols-10">
      {/* Newest video section*/}
      <section className="w-full border-2 border-green-500 flex flex-col items-center justify-center">
        {/* Video data */}
        <div className="aspect-video w-full bg-green-300 rounded-xl flex items-center justify-center relative">
          {/* Top full width overlay with text */}
          <div className="absolute w-full h-12 md:h-16 bg-linear-to-t from-transparent to-black/50 top-0 transition-all duration-300">
            <p className="text-white text-lg md:text-2xl font-bold pl-3 pt-3 md:pl-4 md:pt-4 transition-all duration-300">
              Newest Video
            </p>
          </div>

          {/* Duration */}
          <div className="absolute bottom-1 right-1 p-2 bg-black/50 rounded-xl">
            <p className="text-white text-xs md:text-sm">15:36</p>
          </div>
        </div>

        {/* Uploader & metadata */}
        <div className="w-full flex flex-row py-1">
          {/* Uploader icon */}
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-full m-1 relative transition-all duration-300">
            <Image
              src="/default_icon.png"
              alt="Uploader"
              fill
              className="object-cover rounded-full"
            />
          </div>

          {/* Uploader name & uploaded at */}
          <div className="flex flex-col justify-center items-start px-2">
            <p className="text-white md:text-lg">Meh Chow</p>
            <p className="text-white text-xs md:text-sm">2 hours ago</p>
          </div>

          {/* View count */}
          <div className="flex flex-row justify-center items-start pt-1 px-2 ml-auto gap-1">
            <Eye className="size-4 md:size-5 transition-all duration-300" />
            <p className="text-white text-xs md:text-sm transition-all duration-300">
              100
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
