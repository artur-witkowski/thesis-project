"use server";

import { UserModel } from "@/models/User";
import { openai } from "@ai-sdk/openai";
import { CoreMessage, smoothStream, streamText } from "ai";
import dayjs from "dayjs";

const checkIsSurveyTimeLimitExceeded = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  const user = await UserModel.findOne({ accessToken });
  if (!user) {
    return false;
  }

  const maxFinishedTime = dayjs(user.datetimeSurveyStarted).add(15, "minute");

  if (dayjs().isAfter(maxFinishedTime)) {
    return true;
  }

  return false;
};

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

  const isSurveyTimeLimitExceeded = await checkIsSurveyTimeLimitExceeded({
    accessToken,
  });
  if (isSurveyTimeLimitExceeded) {
    return { success: false, error: "Survey time limit exceeded" };
  }

  user.results = results;
  await user.save();

  return { success: true };
}

export async function generateText({
  accessToken,
  newMessage,
}: {
  accessToken: string;
  newMessage: CoreMessage;
}) {
  const isSurveyTimeLimitExceeded = await checkIsSurveyTimeLimitExceeded({
    accessToken,
  });
  console.log(
    "generateText > isSurveyTimeLimitExceeded",
    isSurveyTimeLimitExceeded
  );
  if (isSurveyTimeLimitExceeded) {
    return null;
  }

  const user = await UserModel.findOne({ accessToken });
  console.log("generateText > user", user);
  const saveChatMessagesResult = await saveChatMessages({
    accessToken,
    newMessage,
  });
  console.log("generateText > saveChatMessagesResult", saveChatMessagesResult);
  if (!saveChatMessagesResult.success) {
    return null;
  }

  const chatHistory = [...(user?.chatHistory ?? []), newMessage];
  console.log("generateText > chatHistory", chatHistory);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: chatHistory,
    experimental_transform: smoothStream(),
    onFinish: (result) => {
      saveChatMessages({
        accessToken,
        newMessage: { role: "assistant", content: result.text },
      });
    },
  });
  console.log("generateText > result", result);
  return result.textStream;
}

async function saveChatMessages({
  accessToken,
  newMessage,
}: {
  accessToken: string;
  newMessage: CoreMessage;
}) {
  const user = await UserModel.findOne({
    accessToken,
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  user.chatHistory = [...(user.chatHistory ?? []), newMessage];
  await user.save();

  return { success: true };
}

export async function getChatHistory({ accessToken }: { accessToken: string }) {
  const user = await UserModel.findOne({ accessToken });
  return user?.chatHistory ?? [];
}
