"use client";

import { useState, useCallback } from "react";
import { createPost, getPostImageUploadUrl } from "@/app/actions/posts";
import { POST_IMAGE_CONSTRAINTS } from "@/lib/constants";
import { toast } from "sonner";

export type ImagePreview = {
  id: string;
  file: File;
  preview: string;
  objectKey?: string; // Set after upload
  isUploading?: boolean;
  isUploaded?: boolean;
  error?: string;
};

export const useAddPost = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const hasUnsavedChanges = content.trim().length > 0 || images.length > 0;

  const resetForm = useCallback(() => {
    setContent("");
    // Revoke all preview URLs
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setIsSubmitting(false);
  }, [images]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && hasUnsavedChanges) {
        setShowCloseWarning(true);
      } else {
        setIsOpen(open);
        if (!open) {
          resetForm();
        }
      }
    },
    [hasUnsavedChanges, resetForm]
  );

  const handleConfirmClose = useCallback(() => {
    setShowCloseWarning(false);
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  const handleCancelClose = useCallback(() => {
    setShowCloseWarning(false);
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const allowedTypes: readonly string[] =
      POST_IMAGE_CONSTRAINTS.ALLOWED_TYPES;
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return `Invalid file type: ${file.name}. Allowed: JPG, PNG, HEIC, WebP, GIF`;
    }

    // Check file size
    if (file.size > POST_IMAGE_CONSTRAINTS.MAX_SIZE) {
      return `File too large: ${file.name}. Maximum size is 10MB`;
    }

    return null;
  }, []);

  const uploadImage = async (
    image: ImagePreview,
    index: number
  ): Promise<string | null> => {
    try {
      // Use proxy upload in development to bypass CORS
      if (process.env.NODE_ENV === "development") {
        const formData = new FormData();
        formData.append("file", image.file);
        formData.append("index", index.toString());

        const response = await fetch("/api/proxy-upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Proxy upload failed");
        }

        return result.objectKey;
      }

      // Production: Use presigned URL
      const urlResult = await getPostImageUploadUrl({
        fileName: image.file.name,
        contentType: image.file.type,
        fileSize: image.file.size,
        index,
      });

      if (!urlResult.success || !urlResult.uploadUrl || !urlResult.objectKey) {
        throw new Error(urlResult.error || "Failed to get upload URL");
      }

      // Upload directly to R2
      const uploadResponse = await fetch(urlResult.uploadUrl, {
        method: "PUT",
        body: image.file,
        headers: {
          "Content-Type": image.file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      return urlResult.objectKey;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleAddImages = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = POST_IMAGE_CONSTRAINTS.MAX_IMAGES - images.length;

      if (remainingSlots <= 0) {
        toast.error(
          `Maximum ${POST_IMAGE_CONSTRAINTS.MAX_IMAGES} images allowed`
        );
        return;
      }

      const filesToAdd = fileArray.slice(0, remainingSlots);
      const newImages: ImagePreview[] = [];

      for (const file of filesToAdd) {
        const error = validateFile(file);
        if (error) {
          toast.error(error);
          continue;
        }

        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          preview: URL.createObjectURL(file),
          isUploading: false,
          isUploaded: false,
        });
      }

      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
      }

      if (fileArray.length > remainingSlots) {
        toast.warning(
          `Only added ${remainingSlots} image(s). Maximum ${POST_IMAGE_CONSTRAINTS.MAX_IMAGES} images allowed.`
        );
      }
    },
    [images.length, validateFile]
  );

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleAddImages(e.dataTransfer.files);
      }
    },
    [handleAddImages]
  );

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    if (content.length > POST_IMAGE_CONSTRAINTS.MAX_CONTENT_LENGTH) {
      toast.error(
        `Content must be ${POST_IMAGE_CONSTRAINTS.MAX_CONTENT_LENGTH} characters or less`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload all images first
      const imageKeys: string[] = [];

      if (images.length > 0) {
        toast.info(`Uploading ${images.length} image(s)...`);

        for (let i = 0; i < images.length; i++) {
          const image = images[i];

          // Update status to uploading
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, isUploading: true } : img
            )
          );

          const objectKey = await uploadImage(image, i);

          if (!objectKey) {
            toast.error(`Failed to upload image ${i + 1}`);
            setIsSubmitting(false);
            return;
          }

          imageKeys.push(objectKey);

          // Update status to uploaded
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? { ...img, isUploading: false, isUploaded: true, objectKey }
                : img
            )
          );
        }
      }

      // Create the post with image keys
      const result = await createPost({
        content: content.trim(),
        imageKeys,
      });

      if (result.success) {
        setIsOpen(false);
        resetForm();
        setShowSuccessDialog(true);
      } else {
        toast.error(result.error || "Failed to create post");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }, [content, images, resetForm]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccessDialog(false);
  }, []);

  return {
    isOpen,
    setIsOpen,
    showCloseWarning,
    showSuccessDialog,
    isSubmitting,
    content,
    setContent,
    images,
    dragActive,
    hasUnsavedChanges,
    handleOpenChange,
    handleConfirmClose,
    handleCancelClose,
    handleAddImages,
    handleRemoveImage,
    handleDrag,
    handleDrop,
    handleSubmit,
    handleSuccessClose,
    maxImages: POST_IMAGE_CONSTRAINTS.MAX_IMAGES,
    maxContentLength: POST_IMAGE_CONSTRAINTS.MAX_CONTENT_LENGTH,
  };
};
