import { z } from "zod";

export const profileSettingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(10, "Maximum 10 characters")
    .regex(/^[a-z0-9 ]+$/i, "Only letters, numbers, and spaces"),
  customIconUrl: z
    .string()
    .trim()
    .min(1, "Invalid icon reference")
    .nullable()
    .optional(),
});

export type ProfileSettingsForm = z.infer<typeof profileSettingsSchema>;

