export type Video = {
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
