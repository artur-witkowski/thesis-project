"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { PreSurveyContent } from "@/components/pre-survey-content";
import { verifyAccessToken } from "@/lib/verifyAccessToken";

function NoAiPreSurveyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const result = await verifyAccessToken(token);
        if (!result.valid || result.taskType !== "no-ai") {
          router.replace("/");
          return;
        }

        setIsVerified(true);
      } catch (error) {
        console.error("Error verifying token:", error);
        router.replace("/");
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
      title="Traditional Ideation Task"
      description="Generate business ideas without AI assistance"
      instructions="In this task, you will be asked to generate business ideas using traditional brainstorming methods. You will have 15 minutes to come up with as many innovative business ideas as possible. Think creatively and don't worry about feasibility at this stage - focus on quantity and variety."
      token={token!}
    />
  );
}

export default function NoAiPreSurvey() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      }
    >
      <NoAiPreSurveyContent />
    </Suspense>
  );
}
