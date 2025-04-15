"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import debounce from "lodash.debounce";
import { endSurveyEarly, saveResults } from "@/app/survey/actions";
import { NoAI } from "@/app/survey/_components/NoAI";
import { AIUnstructured } from "@/app/survey/_components/AIUnstructured";
import { AIStructured } from "@/app/survey/_components/AIStructured";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function SurveyPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [taskType, setTaskType] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [results, setResults] = useState("");
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0) {
      router.replace(`/results?token=${token}`);
    }
  }, [timeLeft, token, router]);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const result = await verifyAccessToken(token);
        if (!result.valid) {
          router.replace("/");
          return;
        }

        if (result.datetimeSurveyFinishedEarly) {
          router.replace(`/results?token=${token}`);
          return;
        }

        setTaskType(result.taskType as string);
        setResults(result.results ?? "");
        const start = dayjs(result.datetimeSurveyStarted);
        const finish = start.add(15, "minute");
        const now = dayjs();
        const remaining = finish.diff(now, "second");
        setTimeLeft(remaining ?? 0);
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

  // Timer effect
  useEffect(() => {
    if (!isVerified) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (!prevTime) return null;
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVerified, token, router]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (
    isLoading ||
    !isVerified ||
    !token ||
    timeLeft === null ||
    timeLeft <= 0
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  const handleSaveResults = debounce(async (unsavedResults: string) => {
    await saveResults({ accessToken: token!, results: unsavedResults });
  }, 1000);

  const handleEndSurvey = async () => {
    await endSurveyEarly({ accessToken: token! });
    router.replace(`/results?token=${token}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen">
      <div className="sticky top-0 bg-white z-10 py-3 border-b mb-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Entrepreneurship Research Survey
        </h1>
        <Button onClick={() => setShowConfirmDialog(true)}>End survey</Button>
        <div
          className={`text-xl font-mono px-4 py-2 rounded-md ${
            timeLeft && timeLeft <= 60
              ? "bg-red-100 text-red-600 animate-pulse"
              : "bg-neutral-100"
          }`}
        >
          {timeLeft ? formatTime(timeLeft) : "00:00"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* This is a placeholder for the actual survey implementation */}
        <div
          className={taskType === "no-ai" ? "md:col-span-5" : "md:col-span-7"}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {taskType === "no-ai"
                  ? "Traditional Ideation"
                  : taskType === "ai-structured"
                  ? "AI-Assisted Structured Ideation"
                  : "AI-Assisted Free-Form Ideation"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {taskType === "no-ai" && <NoAI />}

              {taskType === "ai-structured" && <AIStructured />}

              {taskType === "ai-unstructured" && <AIUnstructured />}
            </CardContent>
          </Card>
        </div>

        <div
          className={taskType === "no-ai" ? "md:col-span-7" : "md:col-span-5"}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Type your business ideas here..."
                className="min-h-[200px] mb-4"
                value={results}
                onChange={(e) => {
                  setResults(e.target.value);
                  handleSaveResults(e.target.value);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish early?</DialogTitle>
            <DialogDescription>
              You are about to finish the survey early. Are you sure you want to
              proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEndSurvey}>Finish the survey</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      }
    >
      <SurveyPageContent />
    </Suspense>
  );
}
