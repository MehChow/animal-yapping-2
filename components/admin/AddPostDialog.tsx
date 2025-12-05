"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusIcon,
  PartyPopperIcon,
  AlertTriangleIcon,
  ImageIcon,
  XIcon,
  Loader2Icon,
  FileTextIcon,
  CheckCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRef } from "react";
import { ImagePreview, useAddPost } from "@/hooks/useAddPost";

const ImagePreviewItem = ({
  image,
  onRemove,
  disabled,
}: {
  image: ImagePreview;
  onRemove: () => void;
  disabled?: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative group aspect-video rounded-lg overflow-hidden border",
        image.isUploading
          ? "border-yellow-500"
          : image.isUploaded
          ? "border-green-500"
          : "border-white/20"
      )}
    >
      <Image
        src={image.preview}
        alt="Preview"
        fill
        className="object-contain bg-black"
      />
      {/* Upload status overlay */}
      {image.isUploading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <Loader2Icon className="size-6 text-yellow-400 animate-spin" />
        </div>
      )}
      {image.isUploaded && (
        <div className="absolute top-1 left-1">
          <CheckCircleIcon className="size-5 text-green-400" />
        </div>
      )}
      {!disabled && !image.isUploading && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Remove image"
        >
          <XIcon className="size-4" />
        </button>
      )}
      <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-black/70 text-white text-xs">
        {(image.file.size / 1024 / 1024).toFixed(1)}MB
      </div>
    </div>
  );
};

export const AddPostDialog = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isOpen,
    setIsOpen,
    showCloseWarning,
    showSuccessDialog,
    isSubmitting,
    content,
    setContent,
    images,
    dragActive,
    handleOpenChange,
    handleConfirmClose,
    handleCancelClose,
    handleAddImages,
    handleRemoveImage,
    handleDrag,
    handleDrop,
    handleSubmit,
    handleSuccessClose,
    maxImages,
    maxContentLength,
  } = useAddPost();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddImages(e.target.files);
      e.target.value = "";
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const canAddMoreImages = images.length < maxImages;
  const remainingChars = maxContentLength - content.length;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 cursor-pointer"
      >
        <FileTextIcon className="size-4 mr-2" />
        Add Post
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl bg-black/95 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Create Community Post
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Share an update with the community. Only admins can create posts.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Content Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/80">
                  Content
                </label>
                <span
                  className={cn(
                    "text-xs",
                    remainingChars < 100
                      ? remainingChars < 0
                        ? "text-red-400"
                        : "text-yellow-400"
                      : "text-white/40"
                  )}
                >
                  {remainingChars} characters remaining
                </span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
                maxLength={maxContentLength + 50}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/80">
                  Images (optional)
                </label>
                <span className="text-xs text-white/40">
                  {images.length}/{maxImages} images
                </span>
              </div>

              {/* Drop Zone */}
              {canAddMoreImages && (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleBrowseClick}
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
                    dragActive
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/20 hover:border-white/40 hover:bg-white/5"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/heic,image/webp,image/gif"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <ImageIcon className="size-8 mx-auto mb-2 text-white/40" />
                  <p className="text-sm text-white/60">
                    Drag and drop images here, or{" "}
                    <span className="text-purple-400">browse</span>
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    JPG, PNG, HEIC, WebP, GIF • Max 10MB per image
                  </p>
                </div>
              )}

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image) => (
                    <ImagePreviewItem
                      key={image.id}
                      image={image}
                      onRemove={() => handleRemoveImage(image.id)}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim() || remainingChars < 0}
              className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <PlusIcon className="size-4 mr-2" />
                  Publish Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Warning Dialog */}
      <AlertDialog open={showCloseWarning} onOpenChange={handleCancelClose}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-2">
              <div className="rounded-full bg-amber-500/20 p-3">
                <AlertTriangleIcon className="size-6 text-amber-500" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">
              Discard Post?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-white/60">
              You have unsaved changes. If you close this dialog, your post will
              be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <AlertDialogCancel
              onClick={handleCancelClose}
              className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10 cursor-pointer"
            >
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClose}
              className="flex-1 bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              Discard & Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleSuccessClose}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-500/20 p-3">
                <PartyPopperIcon className="size-8 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Post Published!
            </DialogTitle>
            <DialogDescription className="text-center text-white/60 pt-2">
              Your post is now live in the community feed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              onClick={handleSuccessClose}
              className="w-full bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
