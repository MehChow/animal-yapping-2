"use client";

import Image from "next/image";
import {
  Settings2Icon,
  UploadIcon,
  ScissorsIcon,
  Loader2,
  Trash2,
} from "lucide-react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useProfileSettingsDialog } from "@/hooks/useProfileSettingsDialog";
import { cn } from "@/lib/utils";

type ProfileSettingsDialogProps = {
  displayName: string;
  imageUrl?: string | null;
};

export const ProfileSettingsDialog: React.FC<ProfileSettingsDialogProps> = ({
  displayName,
  imageUrl,
}) => {
  const {
    isDialogOpen,
    isDiscardDialogOpen,
    isUploading,
    isSaving,
    hasUnsavedChanges,
    imageSrc,
    previewUrl,
    crop,
    setCrop,
    handleImageLoad,
    errors,
    register,
    fileInputRef,
    imgRef,
    handleDialogOpenChange,
    handleDiscardChanges,
    handleCancelDiscard,
    handleFileButtonClick,
    handleFileChange,
    handleCropComplete,
    handleApplyCrop,
    handleRemoveIcon,
    onSubmit,
  } = useProfileSettingsDialog({
    initialName: displayName,
    initialImage: imageUrl,
  });

  const initials = (displayName || "User")
    .slice(0, 2)
    .toUpperCase();

  const shouldDisableSave =
    !hasUnsavedChanges || !!errors.displayName || isSaving || isUploading;

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open profile settings"
            className="size-8 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 cursor-pointer"
          >
            <Settings2Icon className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="bg-slate-900 text-white border-white/10"
        >
          <DialogHeader>
            <DialogTitle>Profile settings</DialogTitle>
            <DialogDescription className="text-white/60">
              Update your display name and profile icon. Changes apply to all pages.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-col items-center gap-2">
                <div className="relative size-24 rounded-full border border-white/20 bg-white/10 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Icon preview"
                      fill
                      unoptimized={previewUrl.startsWith("data:")}
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold">{initials}</span>
                  )}
                </div>
                <p className="text-xs text-white/50">Preview</p>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/heic,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  onClick={handleFileButtonClick}
                  className="cursor-pointer"
                >
                  <UploadIcon className="size-4 mr-2" />
                  Upload icon
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!previewUrl && !imageSrc}
                  onClick={handleRemoveIcon}
                  className="cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="size-4 mr-2" />
                  Remove icon
                </Button>
                <p className="text-xs text-white/50">
                  JPG, PNG, HEIC, or WebP · Max 5MB
                </p>
              </div>
            </section>

            {imageSrc && (
              <section className="space-y-3">
                <p className="text-sm text-white/70">Crop your icon</p>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
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
                      src={imageSrc}
                      alt="Icon to crop"
                      ref={imgRef}
                      onLoad={handleImageLoad}
                      className="max-h-80 object-contain"
                    />
                  </ReactCrop>
                </div>
                <Button type="button" onClick={handleApplyCrop} className="cursor-pointer">
                  <ScissorsIcon className="size-4 mr-2" />
                  Apply crop
                </Button>
              </section>
            )}

            <section className="space-y-2">
              <label htmlFor="displayName" className="text-sm text-white/70">
                Display name *
              </label>
              <Input
                id="displayName"
                {...register("displayName")}
                maxLength={10}
                placeholder="Enter display name"
                aria-invalid={!!errors.displayName}
                className={cn(
                  "bg-white/5 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30",
                  errors.displayName && "border-red-400 focus-visible:ring-red-400"
                )}
              />
              <p className="text-xs text-white/50">
                Only letters and numbers · max 10 characters
              </p>
              {errors.displayName && (
                <p className="text-xs text-red-400">{errors.displayName.message}</p>
              )}
            </section>

            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleDialogOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={shouldDisableSave} className="cursor-pointer">
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isUploading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDiscardDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard profile changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved updates. Closing now will remove them permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelDiscard}
              className="cursor-pointer"
            >
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="cursor-pointer bg-red-500 hover:bg-red-600"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

