"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { startSurvey } from "@/components/actions";

interface PreSurveyContentProps {
  title: string;
  description: string;
  instructions: string;
  token: string;
}

export function PreSurveyContent({
  title,
  description,
  instructions,
  token,
}: PreSurveyContentProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSurvey = async () => {
    setIsStarting(true);
    const result = await startSurvey({ accessToken: token });
    if (!result.success) {
      setIsStarting(false);
      return;
    }

    // Redirect to the survey page with the token and task type
    router.push(`/survey?token=${token}`);
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-3xl shadow-lg border-none">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </CardTitle>
          <CardDescription className="text-lg mt-4">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 md:px-10">
          <div className="prose max-w-none">
            <p className="text-neutral-700">{instructions}</p>
          </div>

          <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
            <h3 className="font-medium text-lg mb-3">What to expect:</h3>
            <ul className="space-y-2 text-neutral-700">
              <li>
                • The survey will take approximately 15 minutes to complete
              </li>
              <li>• You&apos;ll be asked to generate business ideas</li>
              <li>• A timer will be displayed at the top of the page</li>
              <li>• Your responses will be saved automatically</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pb-8 pt-4">
          <Button
            className="w-full h-12 text-base font-medium"
            size="lg"
            onClick={handleStartSurvey}
            disabled={isStarting}
          >
            {isStarting ? "Starting..." : "Start Survey Now"}
          </Button>
          <p className="text-sm text-neutral-500 text-center px-4">
            Once you start, the 15-minute timer will begin. Please ensure you
            have a quiet environment to focus.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
