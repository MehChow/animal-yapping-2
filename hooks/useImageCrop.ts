"use client";

import React, { useCallback, useRef, useState } from "react";
import { getRoundedCroppedImage } from "@/lib/client-image-utils";
import type { Crop } from "react-image-crop";

type UseImageCropProps = {
  onCropApplied: (croppedDataUrl: string) => void;
};

export const useImageCrop = ({ onCropApplied }: UseImageCropProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleCropComplete = useCallback((pixelCrop: Crop | null) => {
    setCompletedCrop(pixelCrop);
  }, []);

  const handleImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const imageElement = event.currentTarget;
      imgRef.current = imageElement;
      const displayWidth = imageElement.width || imageElement.naturalWidth;
      const displayHeight = imageElement.height || imageElement.naturalHeight;
      const size = Math.min(displayWidth, displayHeight) * 0.8;
      const centeredCrop: Crop = {
        unit: "px",
        width: size,
        height: size,
        x: (displayWidth - size) / 2,
        y: (displayHeight - size) / 2,
      };
      setCrop(centeredCrop);
      setCompletedCrop(centeredCrop);
    },
    []
  );

  const handleApplyCrop = useCallback(async () => {
    if (!imgRef.current || !completedCrop) {
      throw new Error("Select an area to crop");
    }

    try {
      const rounded = await getRoundedCroppedImage(
        imgRef.current,
        completedCrop
      );
      onCropApplied(rounded);
      setImageSrc(null);
      setCrop(undefined);
      setCompletedCrop(null);
    } catch (error) {
      console.error("Failed to crop image:", error);
      throw new Error("Unable to crop image");
    }
  }, [completedCrop, onCropApplied]);

  const handleCancelCrop = useCallback(() => {
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(null);
  }, []);

  const startCropping = useCallback((dataUrl: string) => {
    setImageSrc(dataUrl);
    setCrop(undefined);
    setCompletedCrop(null);
  }, []);

  return {
    imageSrc,
    crop,
    setCrop,
    handleCropComplete,
    handleImageLoad,
    handleApplyCrop,
    handleCancelCrop,
    startCropping,
    imgRef,
  };
};
