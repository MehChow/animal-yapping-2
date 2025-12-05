"use client";

import { getThumbnailUrl } from "@/lib/stream-utils";
import { Video } from "@/types/video";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getUserIconUrl } from "@/utils/user-utils";

interface LatestShortsProps {
  shorts: Video[];
}

export const LatestShorts = ({ shorts }: LatestShortsProps) => {
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (shorts) {
      setLoadingImages(new Set(shorts.map((short) => short.id)));
    }
  }, [shorts]);

  if (!shorts || shorts.length === 0) return null;

  const handleImageLoad = (videoId: string) => {
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(videoId);
      return newSet;
    });
  };

  const handleImageError = (videoId: string) => {
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(videoId);
      return newSet;
    });
  };

  return (
    <>
      {/* Title */}
      <h2 className="text-blue-300 text-[5vw] font-bold text-center w-full">
        🕗Shorts
      </h2>

      <div className="w-full relative">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
          className="w-full group"
        >
          <CarouselContent className="-ml-2">
            {shorts.map((short) => (
              <CarouselItem
                key={short.id}
                className="pl-2 basis-auto hover:opacity-90 transition-all duration-300"
              >
                <Link
                  href={`/video/${short.id}`}
                  aria-label={`Watch short: ${short.title}`}
                  className="relative block h-[250px] sm:h-[280px] aspect-9/16 rounded-xl overflow-hidden bg-white/5 cursor-pointer transition-all duration-300"
                >
                  {loadingImages.has(short.id) && (
                    <Skeleton className="absolute inset-0 w-full h-full bg-white/20" />
                  )}
                  <Image
                    src={getThumbnailUrl(short)}
                    alt={short.title}
                    fill
                    className="object-cover"
                    sizes="150px"
                    onLoad={() => handleImageLoad(short.id)}
                    onError={() => handleImageError(short.id)}
                  />

                  {/* Title overlay*/}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                    <div className="flex flex-row items-center gap-2 w-full">
                      <div className="w-8 h-8 shrink-0 rounded-full relative overflow-hidden">
                        <Image
                          src={getUserIconUrl(short.uploadedBy.image)}
                          alt={short.uploadedBy.name || "Anonymous"}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                      <p className="text-white text-xs font-medium line-clamp-2 w-full">
                        {short.title}
                      </p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-2 bg-black/50 hover:bg-black/70 border-none text-white h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" />
          <CarouselNext className="right-2 bg-black/50 hover:bg-black/70 border-none text-white h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" />
        </Carousel>
      </div>
    </>
  );
};
