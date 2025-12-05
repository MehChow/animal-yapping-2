export type PostImage = {
  id: string;
  imageKey: string;
  order: number;
};

export type Post = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  images: PostImage[];
  _count: {
    likes: number;
  };
  isLiked: boolean;
};

// Simplified Post type for interactions (contains only fields needed for like/delete operations)
export type PostInteraction = Pick<Post, "id" | "_count" | "isLiked">;
