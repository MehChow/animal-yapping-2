"use client";

import { useRef } from "react";
import { EditVideoForm } from "./edit-video-form";
import { EditThumbnailEditor } from "./edit-thumbnail-editor";
import type { EditThumbnailEditorRef } from "./edit-thumbnail-editor";
import { ThumbnailSource } from "@/types/thumbnail";

type EditVideoPageClientProps = {
  videoId: string;
  initialData: {
    title: string;
    description?: string;
    tags: string[];
    gameType: string;
    videoType: "Normal" | "Shorts";
    streamUid: string | null;
    videoDuration: number;
    thumbnailSource: ThumbnailSource;
    thumbnailTimestamp: number | null;
    customThumbnailKey: string | null;
  };
};

export const EditVideoPageClient = ({
  videoId,
  initialData,
}: EditVideoPageClientProps) => {
  const thumbnailEditorRef = useRef<EditThumbnailEditorRef | null>(null);

  const getThumbnailData = () => {
    return thumbnailEditorRef.current?.getThumbnailData();
  };

  return (
    <div className="flex flex-col md:flex-row md:items-stretch gap-6 pb-8 md:pb-0">
      {/* Left: Thumbnail Editor */}
      <div className="w-full md:w-1/2 md:shrink-0 flex">
        <div className="rounded-md border border-white/10 shadow-lg backdrop-blur-sm bg-white/5 p-6 flex flex-col w-full">
          <h2 className="text-xl font-bold text-white mb-4">Thumbnail</h2>
          <div className="flex-1">
            <EditThumbnailEditor
              ref={thumbnailEditorRef}
              streamUid={initialData.streamUid}
              videoType={initialData.videoType}
              videoDuration={initialData.videoDuration}
              currentThumbnailSource={initialData.thumbnailSource}
              currentThumbnailTimestamp={initialData.thumbnailTimestamp}
              currentCustomThumbnailKey={initialData.customThumbnailKey}
            />
          </div>
        </div>
      </div>

      {/* Right: Form Details */}
      <div className="w-full md:w-1/2 md:shrink-0 flex">
        <div className="rounded-md border border-white/10 shadow-lg backdrop-blur-sm bg-white/5 p-6 flex flex-col w-full">
          <h2 className="text-xl font-bold text-white mb-4">Video Details</h2>
          <div className="flex-1 flex flex-col">
            <EditVideoForm
              videoId={videoId}
              initialData={initialData}
              getThumbnailData={getThumbnailData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
