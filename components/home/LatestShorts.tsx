import { getThumbnailUrl } from "@/lib/stream-utils";
import { Video } from "@/types/video";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface LatestShortsProps {
  shorts: Video[];
}

export const LatestShorts = ({ shorts }: LatestShortsProps) => {
  if (!shorts || shorts.length === 0) return null;

  return (
    <>
      {/* Title */}
      <h2 className="text-blue-300 text-2xl font-bold text-center w-full">
        🕗Shorts
      </h2>

      <div className="w-full relative">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-3">
            {shorts.map((short) => (
              <CarouselItem
                key={short.id}
                className="pl-2 md:pl-3 basis-auto hover:opacity-90 transition-all duration-300"
              >
                <Link
                  href={`/video/${short.id}`}
                  aria-label={`Watch short: ${short.title}`}
                  className="relative block h-[250px] sm:h-[280px] md:h-[300px] aspect-9/16 rounded-xl overflow-hidden bg-white/5 cursor-pointer transition-all duration-300"
                >
                  <Image
                    src={getThumbnailUrl(short)}
                    alt={short.title}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />

                  {/* Title overlay*/}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                    <div className="flex flex-row items-center gap-2 w-full">
                      <div className="w-8 h-8 shrink-0 rounded-full relative overflow-hidden">
                        <Image
                          src="/default_icon.png"
                          alt="Uploader"
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
