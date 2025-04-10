"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { PreSurveyContent } from "@/components/pre-survey-content";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import { redirect } from "next/navigation";

function AiStructuredPreSurveyContent() {
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
        if (!result.valid || result.taskType !== "ai-structured") {
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
      title="AI-Assisted Ideation (Structured)"
      description="Generate business ideas with AI assistance using a guided approach"
      instructions="In this task, you will be asked to generate business ideas with the help of AI using a structured approach. You will follow specific prompts and guidelines to interact with the AI assistant. This structured method is designed to help you systematically explore different aspects of business ideation. You will have 15 minutes to collaborate with the AI to generate innovative business ideas following the provided framework."
      token={token!}
    />
  );
}

export default function AiStructuredPreSurvey() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-xl">Loading...</div>
    </div>}>
      <AiStructuredPreSurveyContent />
    </Suspense>
  );
}
