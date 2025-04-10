"use server";

import { UserModel } from "@/models/User";

export async function getResults({ accessToken }: { accessToken: string }) {
  const user = await UserModel.findOne({ accessToken });
  return user?.results ?? "";
}
