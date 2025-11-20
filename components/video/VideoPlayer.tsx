"use client";

import { useEffect, useRef } from "react";
import { Stream } from "@cloudflare/stream-react";
import { trackVideoView } from "@/app/actions/video-page";

type VideoPlayerProps = {
  video: {
    id: string;
    streamUid: string | null;
    title: string;
    videoType: string;
    [key: string]: any; // Allow other fields
  };
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const hasTrackedView = useRef(false);

  useEffect(() => {
    // Track view once when component mounts
    if (!hasTrackedView.current && video.streamUid) {
      hasTrackedView.current = true;
      trackVideoView(video.id);
    }
  }, [video.id, video.streamUid]);

  if (!video.streamUid) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border border-white/10 bg-black overflow-hidden ${
        video.videoType === "Shorts"
          ? "h-full aspect-9/16"
          : "aspect-video max-h-full max-w-full"
      }`}
    >
      <Stream controls src={video.streamUid} autoplay muted preload="auto" />
    </div>
  );
};
