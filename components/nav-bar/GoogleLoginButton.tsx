"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { LogInIcon } from "lucide-react";

export function GoogleLoginButton() {
  const handleLogin = async () => {
    await signIn.social({ provider: "google", callbackURL: "/" });
  };

  return (
    <Button
      onClick={async () => {
        await handleLogin();
      }}
      variant="ghost"
      className="text-white cursor-pointer hover:bg-accent-foreground hover:text-white"
    >
      <LogInIcon className="size-4" />
      Login with Google
    </Button>
  );
}
