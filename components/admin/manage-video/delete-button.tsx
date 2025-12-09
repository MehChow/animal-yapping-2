"use client";

import { Button } from "@/components/ui/button";
import { Trash, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { deleteVideo } from "@/app/actions/video";
import { toast } from "sonner";
import { tryCatch } from "@/lib/try-catch";

type DeleteButtonProps = {
  videoId: string;
};

export const DeleteButton = ({ videoId }: DeleteButtonProps) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing dialog during deletion
    if (isDeleting) {
      return;
    }
    setOpen(newOpen);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDeleting(true);

    const { data: result, error } = await tryCatch(deleteVideo({ videoId }));

    if (error) {
      toast.error("An unexpected error occurred");
      console.error("Delete error:", error);
      setIsDeleting(false);
    } else if (result?.success) {
      toast.success(result.message || "Video deleted successfully!");
      setIsDeleting(false);
      setOpen(false);
    } else {
      toast.error(result?.error || "Failed to delete video");
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon-sm"
          className="rounded-full cursor-pointer bg-red-500 hover:bg-red-600 border-0"
        >
          <Trash className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-lg font-bold">
            🗑️Delete Video
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white">
            Are you sure you want to delete this video? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="text-white cursor-pointer bg-zinc-800 hover:bg-white/10 hover:text-white border-0 focus:outline-none w-1/2"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer w-1/2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
