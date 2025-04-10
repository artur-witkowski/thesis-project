"use server";

import dbConnect from "./dbConnect";
import { UserModel } from "@/models/User";
import { TYPE_OF_TASK } from "@/types/User";

export async function verifyAccessToken(accessToken: string): Promise<{
  valid: boolean;
  userId?: string;
  taskType?: (typeof TYPE_OF_TASK)[keyof typeof TYPE_OF_TASK];
  datetimeSurveyStarted?: Date;
  results?: string;
}> {
  try {
    await dbConnect();

    const user = await UserModel.findOne({ accessToken });

    if (!user) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: user.id.toString(),
      taskType: user.typeOfTask,
      datetimeSurveyStarted: user.datetimeSurveyStarted,
      results: user.results,
    };
  } catch (error) {
    console.error("Error verifying access token:", error);
    return { valid: false };
  }
}
