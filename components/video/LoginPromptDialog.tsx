"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, X } from "lucide-react";
import { signIn } from "@/lib/auth-client";

type LoginPromptDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const LoginPromptDialog: React.FC<LoginPromptDialogProps> = ({
  open,
  onClose,
}) => {
  const handleLogin = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: window.location.href,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-purple-500/20 p-3">
              <LogIn className="size-8 text-purple-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Login Required
          </DialogTitle>
          <DialogDescription className="text-center text-white/60 pt-2">
            You need to be logged in to like videos, save favorites, or post
            comments. Please sign in to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="size-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleLogin}
            className="flex-1 bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
          >
            <LogIn className="size-4 mr-2" />
            Sign In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
