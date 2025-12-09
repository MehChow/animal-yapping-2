"use client";

import { useCallback, useState } from "react";

export type UseThumbnailLoadingResult = {
  isLoaded: boolean;
  handleLoad: () => void;
};

export const useThumbnailLoading = (): UseThumbnailLoadingResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const handleLoad = useCallback(() => setIsLoaded(true), []);

  return { isLoaded, handleLoad };
};

