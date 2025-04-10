"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PreSurveyContent } from "@/components/pre-survey-content";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import { redirect } from "next/navigation";

export default function NoAiPreSurvey() {
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
        if (!result.valid || result.taskType !== "no-ai") {
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
      title="Traditional Ideation Task"
      description="Generate business ideas without AI assistance"
      instructions="In this task, you will be asked to generate business ideas using traditional brainstorming methods. You will have 15 minutes to come up with as many innovative business ideas as possible. Think creatively and don't worry about feasibility at this stage - focus on quantity and variety."
      token={token!}
    />
  );
}
