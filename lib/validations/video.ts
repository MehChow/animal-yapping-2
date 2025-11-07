import { z } from "zod";

export const videoMetadataSchema = z.object({
  title: z
    .string()
    .min(1, "Video title is required")
    .max(100, "Title must be 100 characters or less")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .trim(),
  tags: z.array(z.string().trim().min(1)).max(10, "Maximum 10 tags allowed"),
});

export type VideoMetadataForm = z.infer<typeof videoMetadataSchema>;
