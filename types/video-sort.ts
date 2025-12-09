export type VideoSortValue = "latest" | "earliest" | "liked" | "viewed";

export const DEFAULT_VIDEO_SORT: VideoSortValue = "latest";

export const isVideoSortValue = (value: string | undefined): value is VideoSortValue => {
  if (!value) return false;
  return ["latest", "earliest", "liked", "viewed"].includes(value);
};

