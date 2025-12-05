import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PostImage } from "@/types/post";

const getImageUrl = (imageKey: string): string => {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  return publicUrl ? `${publicUrl}/${imageKey}` : "";
};

interface PostImageCarouselProps {
  images: PostImage[];
}

export const PostImageCarousel = ({ images }: PostImageCarouselProps) => {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
        <Image
          src={getImageUrl(images[0].imageKey)}
          alt="Post image"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.id}>
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-white/20">
              <Image
                src={getImageUrl(image.imageKey)}
                alt="Post image"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 bg-white/50 border-0 text-black hover:bg-white/70" />
      <CarouselNext className="right-2 bg-white/50 border-0 text-black hover:bg-white/70" />
    </Carousel>
  );
};
