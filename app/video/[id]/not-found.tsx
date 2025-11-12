import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoOff } from "lucide-react";

export default function VideoNotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 pt-16">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-white/5 p-6">
            <VideoOff className="size-20 text-white/40" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Video Not Found</h1>
          <p className="text-white/60 text-lg">
            The video you're looking for doesn't exist or has been removed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            asChild
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
          >
            <Link href="/explore">Browse Videos</Link>
          </Button>
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
          >
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

