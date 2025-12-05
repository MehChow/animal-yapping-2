"use client";

import { SettingsIcon } from "lucide-react";
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
import { useProfileSettingsDialog } from "@/hooks/useProfileSettingsDialog";
import { cn } from "@/lib/utils";
import { DiscardProfileChangesDialog } from "./DiscardProfileChangesDialog";
import { CropImageDialog } from "./CropImageDialog";
import { Spinner } from "../ui/spinner";
import { ProfileIconPreview } from "../ui/ProfileIconPreview";
import { ImageErrorBoundary } from "../error/ImageErrorBoundary";

type ProfileSettingsDialogProps = {
  displayName: string;
  imageUrl?: string | null;
  initials: string;
  userId: string;
};

export const ProfileSettingsDialog: React.FC<ProfileSettingsDialogProps> = ({
  displayName,
  imageUrl,
  initials,
  userId,
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
    errors,
    register,
    fileInputRef,
    imgRef,
    handleDialogOpenChange,
    handleDiscardChanges,
    handleCancelDiscard,
    handleFileButtonClick,
    handleFileChange,
    handleImageLoad,
    handleCropComplete,
    handleApplyCrop,
    handleCancelCrop,
    handleRemoveIcon,
    onSubmit,
    setCrop,
  } = useProfileSettingsDialog({
    initialName: displayName,
    initialImage: imageUrl,
    userId,
  });

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
            className="size-8 rounded-full text-white hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <SettingsIcon className="size-4" />
          </Button>
        </DialogTrigger>

        <DialogContent
          showCloseButton={false}
          className="bg-zinc-900 border-zinc-800 text-white"
        >
          <DialogHeader className="pointer-events-none">
            <DialogTitle>Profile settings</DialogTitle>
            <DialogDescription className="text-white/60">
              Update your display name and profile icon here
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-6">
            <section className="gap-4 flex flex-col items-center">
              {/* Icon */}
              <ProfileIconPreview
                previewUrl={previewUrl}
                initials={initials}
                onRemove={handleRemoveIcon}
              />

              {/* Upload Icon */}
              <input
                id="fileInput"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/heic,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="fileInput">
                <Button
                  type="button"
                  onClick={handleFileButtonClick}
                  className="cursor-pointer bg-purple-500 hover:bg-purple-600"
                >
                  Upload icon
                </Button>
              </label>

              <p className="text-xs text-white/30 text-center pointer-events-none">
                JPG, PNG, HEIC, or WebP · Max 5MB
              </p>
            </section>

            {/* Display name */}
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
                  errors.displayName &&
                    "border-red-400 focus-visible:ring-red-400"
                )}
              />

              <p className="text-xs text-white/50">
                Only letters and numbers · max 10 characters
              </p>

              {errors.displayName && (
                <p className="text-xs text-red-400">
                  {errors.displayName.message}
                </p>
              )}
            </section>

            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleDialogOpenChange(false)}
                className="cursor-pointer bg-zinc-800 hover:bg-white/10"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={shouldDisableSave}
                className="cursor-pointer bg-green-500 hover:bg-green-600"
              >
                {isSaving ? <Spinner /> : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Discard Profile Changes Dialog */}
      <DiscardProfileChangesDialog
        isDiscardDialogOpen={isDiscardDialogOpen}
        handleCancelDiscard={handleCancelDiscard}
        handleDiscardChanges={handleDiscardChanges}
      />

      {/* Crop Image Dialog */}
      <ImageErrorBoundary>
        <CropImageDialog
          isOpen={!!imageSrc}
          imageSrc={imageSrc}
          crop={crop}
          setCrop={setCrop}
          handleImageLoad={handleImageLoad}
          handleCropComplete={handleCropComplete}
          handleApplyCrop={handleApplyCrop}
          handleCancelCrop={handleCancelCrop}
          imgRef={imgRef}
        />
      </ImageErrorBoundary>
    </>
  );
};
