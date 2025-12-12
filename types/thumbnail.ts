export type ThumbnailSource = "stream" | "custom";

export type ThumbnailUpdateData =
  | {
      thumbnailSource: "stream";
      thumbnailTimestamp: number | null;
      customThumbnailKey: null;
    }
  | {
      thumbnailSource: "custom";
      thumbnailTimestamp: null;
      customThumbnailPreview: string | null;
      customThumbnailContentType: string | null;
      oldCustomThumbnailKey: string | null;
    };

export type VideoThumbnailInfo = {
  streamUid: string | null;
  thumbnailSource?: ThumbnailSource;
  thumbnailTimestamp?: number | null;
  customThumbnailKey?: string | null;
};
