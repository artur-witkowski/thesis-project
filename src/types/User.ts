export const TYPE_OF_TASK = {
  NO_AI: "no-ai",
  AI_UNSTRUCTURED: "ai-unstructured",
  AI_STRUCTURED: "ai-structured",
} as const;

export interface User {
  id: string;
  accessToken: string;
  typeOfTask: (typeof TYPE_OF_TASK)[keyof typeof TYPE_OF_TASK];
  chatHistory: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  results: string;
  datetimeSurveyStarted: Date | null;
  currentStep: number | null;
  datetimeSurveyFinishedEarly: Date | null;
}
