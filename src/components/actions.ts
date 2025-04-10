"use server";

import { UserModel } from "@/models/User";

export const startSurvey = async ({ accessToken }: { accessToken: string }) => {
  const user = await UserModel.findOne({ accessToken });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  user.datetimeSurveyStarted = new Date();
  await user.save();

  return { success: true };
};
