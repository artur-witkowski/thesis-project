"use server";

import { UserModel } from "@/models/User";

export async function saveResults({
  accessToken,
  results,
}: {
  accessToken: string;
  results: string;
}) {
  const user = await UserModel.findOne({ accessToken });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  user.results = results;
  await user.save();

  return { success: true };
}
