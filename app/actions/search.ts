"use server";

import { searchVideos } from "@/lib/data/video";

type SearchVideosParams = {
  query: string;
  cursor?: string;
  limit?: number;
};

export const searchVideosAction = async ({
  query,
  cursor,
  limit = 10,
}: SearchVideosParams) => {
  return await searchVideos(query, limit, cursor);
};

