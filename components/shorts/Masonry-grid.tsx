"use client";

import { getStreamThumbnailUrl } from "@/lib/stream-utils";
import { Video } from "@/types/video";
import { MasonryProps } from "masonic";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ComponentType } from "react";
import Link from "next/link";
import { Metadata } from "./Metadata";

const Masonry: ComponentType<MasonryProps<Video>> = dynamic(
  () => import("masonic").then((mod) => mod.Masonry),
  { ssr: false }
);

type MasonryComponentProps = {
  shorts: Video[];
};

const MasonryComponent = ({ shorts }: MasonryComponentProps) => {
  return (
    <Masonry
      items={shorts}
      render={MasonryCard}
      columnGutter={16}
      rowGutter={16}
      columnWidth={240}
    />
  );
};

const MasonryCard = ({ index, data }: { index: number; data: Video }) => {
  // The video with latestVideoId gets the gradient border when fully l oaded
  const isLatestVideo = index === 0;

  console.log("re-rendered");

  return (
    <div className="relative">
      {isLatestVideo ? (
        <div className="dark-gradient rounded-2xl p-[3px] -m-[3px]">
          <div className="relative z-10 bg-black rounded-2xl">
            <Link href={`/video/${data.id}`} className="block">
              <div className="bg-white/5 rounded-2xl p-3 transition-all duration-300 hover:bg-white/10">
                {/* Thumbnail Container */}
                <div className="relative mb-3">
                  <div className="bg-gray-800 rounded-2xl aspect-9/16 transition-colors relative overflow-hidden">
                    <Image
                      src={getStreamThumbnailUrl(data.streamUid)}
                      alt={data.title}
                      fill
                      className={`object-cover transition-opacity duration-300 rounded-2xl z-10`}
                    />
                  </div>
                </div>

                {/* Metadata Section */}
                <Metadata data={data} />
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <Link href={`/video/${data.id}`} className="block">
          <div className="bg-white/5 rounded-2xl p-3 transition-all duration-300 hover:bg-white/10">
            {/* Thumbnail Container */}
            <div className="relative mb-3">
              <div className="bg-gray-800 rounded-2xl aspect-9/16 transition-colors relative overflow-hidden">
                <Image
                  src={getStreamThumbnailUrl(data.streamUid)}
                  alt={data.title}
                  fill
                  className={`object-cover transition-opacity duration-300 rounded-2xl z-10`}
                />
              </div>
            </div>

            {/* Metadata Section */}
            <Metadata data={data} />
          </div>
        </Link>
      )}
    </div>
  );
};

export default MasonryComponent;
