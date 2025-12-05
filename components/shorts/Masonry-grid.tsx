"use client";

import { getThumbnailUrl } from "@/lib/stream-utils";
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
  if (shorts.length === 0) {
    return <div className="text-white text-center">No shorts found</div>;
  }

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

type MasonryCardProps = {
  index: number;
  data: Video;
};

const MasonryCard = ({ index, data }: MasonryCardProps) => {
  // The video with latestVideoId gets the gradient border when fully loaded
  const isLatestVideo = index === 0;

  const cardContent = (
    <Link href={`/video/${data.id}`} className="block">
      <div className="bg-white/5 rounded-2xl p-3 transition-all duration-300 hover:bg-white/10">
        {/* Thumbnail Container */}
        <div className="relative mb-3">
          <div className="bg-gray-800 rounded-2xl aspect-9/16 transition-colors relative overflow-hidden">
            <Image
              src={getThumbnailUrl(data)}
              alt={data.title}
              fill
              className="object-cover transition-opacity duration-300 rounded-2xl z-10"
              sizes="(max-width: 600px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />
          </div>
        </div>

        {/* Metadata Section */}
        <Metadata data={data} />
      </div>
    </Link>
  );

  return (
    <div className="relative">
      {isLatestVideo ? (
        <div className="dark-gradient rounded-2xl">
          <div className="relative z-10 bg-black/95 rounded-2xl">
            {cardContent}
          </div>
        </div>
      ) : (
        cardContent
      )}
    </div>
  );
};

export default MasonryComponent;
