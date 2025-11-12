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
      className={`relative w-full overflow-hidden rounded-lg border border-white/10 bg-black ${
        video.videoType === "Shorts"
          ? "aspect-9/16 max-w-md mx-auto"
          : "aspect-video"
      }`}
    >
      <Stream
        controls
        src={video.streamUid}
        autoplay
        muted
        preload="auto"
        width="100%"
        height="100%"
      />
    </div>
  );
};
