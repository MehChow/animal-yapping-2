"use client";

import { ScissorsIcon, X } from "lucide-react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Crop } from "react-image-crop";

type CropImageDialogProps = {
  isOpen: boolean;
  imageSrc: string | null;
  crop: Crop | undefined;
  setCrop: (crop: Crop | undefined) => void;
  handleImageLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  handleCropComplete: (pixelCrop: Crop | null) => void;
  handleApplyCrop: () => void;
  handleCancelCrop: () => void;
  imgRef: React.RefObject<HTMLImageElement | null>;
};

export const CropImageDialog: React.FC<CropImageDialogProps> = ({
  isOpen,
  imageSrc,
  crop,
  setCrop,
  handleImageLoad,
  handleCropComplete,
  handleApplyCrop,
  handleCancelCrop,
  imgRef,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={handleCancelCrop}>
      <DialogContent
        showCloseButton={false}
        className="bg-zinc-900 border-zinc-800 text-white"
      >
        <DialogHeader>
          <DialogTitle>Crop your icon</DialogTitle>
          <DialogDescription className="text-white/60">
            Adjust the crop area to select the part of the image you want to use
            as your profile icon
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3 flex items-center justify-center">
            <ReactCrop
              crop={crop}
              circularCrop
              keepSelection
              ruleOfThirds
              aspect={1}
              minWidth={40}
              onChange={(nextCrop) => setCrop(nextCrop)}
              onComplete={handleCropComplete}
              className="max-h-80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc!}
                alt="Icon to crop"
                ref={imgRef}
                onLoad={handleImageLoad}
                className="max-h-80 object-contain"
              />
            </ReactCrop>
          </div>

          <Button
            type="button"
            onClick={handleApplyCrop}
            className="cursor-pointer bg-green-500 hover:bg-green-600 w-full"
          >
            <ScissorsIcon className="size-4 mr-1" />
            Apply crop
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
