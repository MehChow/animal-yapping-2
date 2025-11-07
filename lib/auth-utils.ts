import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "Admin" | "Moderator" | "Viewer";

export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user;
};

export const getCurrentUserRole = async (): Promise<UserRole | null> => {
  const user = await getCurrentUser();
  return (user?.role as UserRole) || null;
};

export const requireAuth = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/");
  }
  
  return user;
};

export const requireRole = async (allowedRoles: UserRole[]) => {
  const user = await requireAuth();
  const userRole = user.role as UserRole;
  
  if (!allowedRoles.includes(userRole)) {
    redirect("/");
  }
  
  return user;
};

export const isAdmin = async (): Promise<boolean> => {
  const role = await getCurrentUserRole();
  return role === "Admin";
};

export const isModerator = async (): Promise<boolean> => {
  const role = await getCurrentUserRole();
  return role === "Moderator" || role === "Admin";
};

