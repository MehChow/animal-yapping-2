export const getUserIconUrl = (imageKey: string): string => {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  return publicUrl ? `${publicUrl}${imageKey}` : "";
};
