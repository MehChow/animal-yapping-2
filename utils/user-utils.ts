export const getUserIconUrl = (imageKey?: string | null): string => {
  if (!imageKey) return "";

  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  return publicUrl ? `${publicUrl}/${imageKey}` : "";
};
