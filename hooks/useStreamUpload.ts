import { useState } from "react";
import { toast } from "sonner";
import { getStreamUploadUrl } from "@/app/actions/stream-upload";

export const useStreamUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [streamUid, setStreamUid] = useState<string | null>(null);

  const uploadToStream = async (videoFile: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get upload URL from server
      const result = await getStreamUploadUrl({
        fileName: videoFile.name,
        fileSize: videoFile.size,
      });

      if (!result.success || !result.uploadUrl || !result.uid) {
        toast.error(result.error || "Failed to get upload URL");
        setIsUploading(false);
        return null;
      }

      const { uploadUrl, uid } = result;
      setStreamUid(uid);

      // Step 2: Create FormData
      const formData = new FormData();
      formData.append("file", videoFile);

      // Step 3: Upload with fetch (simple, no TUS)
      setUploadProgress(10);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentage = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentage);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setIsUploading(false);
            toast.success("Video uploaded! Processing...");
            resolve(uid);
          } else {
            setIsUploading(false);
            toast.error("Failed to upload video");
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          setIsUploading(false);
          toast.error("Failed to upload video");
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", uploadUrl);
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Stream upload error:", error);
      toast.error("Failed to upload video");
      setIsUploading(false);
      return null;
    }
  };

  return {
    uploadToStream,
    isUploading,
    uploadProgress,
    streamUid,
  };
};
