"use client";

import { getStreamThumbnailUrl } from "@/lib/stream-utils";
import { Video } from "@/types/video";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRouter } from "next/navigation";

interface LatestShortsProps {
  shorts: Video[];
}

export const LatestShorts = ({ shorts }: LatestShortsProps) => {
  if (!shorts || shorts.length === 0) return null;
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <p className="text-2xl font-semibold pb-2">Shorts</p>
      <div className="flex-1 min-h-0 relative group">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          // Ensure the viewport (direct child div) takes full height
          className="w-full h-full [&>div]:h-full"
        >
          {/* Ensure the track takes full height */}
          <CarouselContent className="-ml-2 md:-ml-4 h-full">
            {shorts.map((short) => (
              <CarouselItem
                onClick={() => router.push(`/video/${short.id}`)}
                key={short.id}
                // Remove fixed basis, allow auto width based on aspect-ratio content
                className="pl-2 md:pl-4 basis-auto h-full cursor-pointer"
              >
                <div className="relative h-full aspect-9/16 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <Image
                    src={getStreamThumbnailUrl(short.streamUid)}
                    alt={short.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white font-medium truncate w-full pb-2 pl-2">
                      {short.title}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 bg-black/50 hover:bg-black/70 border-none text-white h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" />
          <CarouselNext className="right-2 bg-black/50 hover:bg-black/70 border-none text-white h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" />
        </Carousel>
      </div>
    </div>
  );
};
