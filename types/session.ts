import { auth } from "@/lib/auth";

export type NullableUserSession = Awaited<
  ReturnType<typeof auth.api.getSession>
>;
export type NonNullUserSession = NonNullable<NullableUserSession>;
