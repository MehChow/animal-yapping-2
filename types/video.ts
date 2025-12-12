export type Video = {
  // Types
  thumbnailSource: import("./thumbnail").ThumbnailSource;
  id: string;
  title: string;
  description: string;
  gameType: string;
  videoType: string;
  tags: string[];
  streamUid: string;
  duration: number;
  status: string;
  viewCount: number;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  // Thumbnail fields
  thumbnailTimestamp: number | null;
  customThumbnailKey: string | null;
  // Relations
  uploadedBy: {
    id: string;
    name: string;
    image: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
};
