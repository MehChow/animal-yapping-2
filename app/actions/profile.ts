"use server";

import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/lib/auth-utils";
import {
  profileSettingsSchema,
  type ProfileSettingsForm,
} from "@/lib/validations/user";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

type UpdateProfileInput = ProfileSettingsForm;

type UpdateProfileResult = {
  success: boolean;
  error?: string;
};

export const updateProfileSettings = async (
  input: UpdateProfileInput
): Promise<UpdateProfileResult> => {
  try {
    const user = await requireAuth();
    const parsed = profileSettingsSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { displayName, customIconUrl } = parsed.data;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: displayName,
        image: customIconUrl ?? null,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to update profile",
    };
  }
};

