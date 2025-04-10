"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PreSurveyContent } from "@/components/pre-survey-content";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import { redirect } from "next/navigation";

export default function AiUnstructuredPreSurvey() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        redirect("/");
        return;
      }

      try {
        const result = await verifyAccessToken(token);
        if (!result.valid || result.taskType !== "ai-unstructured") {
          redirect("/");
          return;
        }

        setIsVerified(true);
      } catch (error) {
        console.error("Error verifying token:", error);
        redirect("/");
      } finally {
        setIsLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (!isVerified) {
    return null; // Will redirect in useEffect
  }

  // At this point, token is guaranteed to be non-null due to our verification logic
  return (
    <PreSurveyContent
      title="AI-Assisted Ideation (Free-Form)"
      description="Generate business ideas with AI assistance in an unstructured format"
      instructions="In this task, you will be asked to generate business ideas with the help of AI. You can interact with the AI assistant in any way you prefer - there are no specific guidelines for how to structure your conversation. Feel free to ask questions, request suggestions, or explore different business domains. You will have 15 minutes to collaborate with the AI to generate innovative business ideas."
      token={token!}
    />
  );
}
