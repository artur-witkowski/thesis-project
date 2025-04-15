"use server";

import { UserModel } from "@/models/User";
import { openai } from "@ai-sdk/openai";
import { CoreMessage, smoothStream, streamText } from "ai";
import dayjs from "dayjs";

const checkIfSurveyDataCanBeChanged = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  const user = await UserModel.findOne({ accessToken });
  if (!user) {
    return false;
  }

  const maxFinishedTime = dayjs(user.datetimeSurveyStarted).add(15, "minute");
  const isSurveyFinishedEarly = !!user.datetimeSurveyFinishedEarly;

  if (dayjs().isAfter(maxFinishedTime) || isSurveyFinishedEarly) {
    return false;
  }

  return true;
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

  const doesSurveyDataCanBeChanged = await checkIfSurveyDataCanBeChanged({
    accessToken,
  });
  if (!doesSurveyDataCanBeChanged) {
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
  const doesSurveyDataCanBeChanged = await checkIfSurveyDataCanBeChanged({
    accessToken,
  });
  console.log(
    "generateText > doesSurveyDataCanBeChanged",
    doesSurveyDataCanBeChanged
  );
  if (!doesSurveyDataCanBeChanged) {
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
    onError: (error) => {
      console.error("Error generating response:", error);
    },
  });

  return result.textStream;
}

const steps = [
  {
    systemPrompt: `You are an AI assistant helping with a creativity research experiment. The user is in the EXPLORE phase of idea generation. Your goal is to encourage FLUENCY - generating many ideas quickly without worrying about quality.`,
  },
  {
    systemPrompt: `You are an AI assistant helping with a creativity research experiment. The user is in the SHIFT PERSPECTIVES phase of idea generation. Your goal is to encourage FLEXIBILITY - thinking of different types of ideas from various angles.`,
  },
  {
    systemPrompt: `You are an AI assistant helping with a creativity research experiment. The user is in the BE UNIQUE phase of idea generation. Your goal is to encourage ORIGINALITY - making ideas stand out with twists or innovations.`,
  },
  {
    systemPrompt: `You are an AI assistant helping with a creativity research experiment. The user is in the DEEPEN ONE phase of idea generation. Your goal is to encourage ELABORATION - developing one idea in greater detail.`,
  },
];

export async function goToTheStep({
  accessToken,
  step,
}: {
  accessToken: string;
  step: number;
}) {
  const user = await UserModel.findOne({ accessToken });
  if (!user) {
    return { success: false, error: "User not found" };
  }
  const foundStep = steps[step];
  if (!foundStep) {
    return { success: false, error: "Step not found" };
  }

  user.chatHistory = [
    ...(user.chatHistory ?? []),
    { role: "system", content: foundStep.systemPrompt },
  ];
  user.currentStep = step;
  await user.save();

  return { success: true };
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
  return (
    user?.chatHistory?.filter((m: CoreMessage) => m.role !== "system") ?? []
  );
}

export async function getCurrentStep({ accessToken }: { accessToken: string }) {
  const user = await UserModel.findOne({ accessToken });
  return user?.currentStep ?? null;
}

export const endSurveyEarly = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  const user = await UserModel.findOne({ accessToken });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  user.datetimeSurveyFinishedEarly = new Date();
  await user.save();

  return { success: true };
};
