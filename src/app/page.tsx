"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramAccessToken = searchParams.get("token");
  const [accessCode, setAccessCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paramAccessToken) {
      setAccessCode(paramAccessToken);
    }
  }, [paramAccessToken]);

  const handleStartSurvey = async () => {
    if (!accessCode.trim()) {
      setError("Please enter your access code");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyAccessToken(accessCode);

      if (result.valid && result.taskType) {
        // Redirect to the appropriate pre-survey page based on task type
        router.push(`/pre-survey/${result.taskType}?token=${accessCode}`);
      } else {
        setError("Invalid access code. Please check and try again.");
      }
    } catch (error) {
      console.error("Error verifying access code:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 p-4 md:p-8">
      <main className="w-full max-w-3xl mx-auto">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight md:text-4xl">
              Entrepreneurship Research Study
            </CardTitle>
            <CardDescription className="text-lg mt-4">
              Explore how entrepreneurs use AI to generate business ideas
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-6 md:px-10">
            <div className="prose max-w-none">
              <p className="text-neutral-700">
                Welcome to my research study on entrepreneurial ideation. This
                project analyzes how entrepreneurs utilize ChatGPT to generate
                innovative business ideas. Your participation will contribute to
                valuable insights in the field of entrepreneurship.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Label htmlFor="access-code" className="text-base">
                Enter your access code
              </Label>
              <Input
                id="access-code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter the code provided to you"
                className="h-12"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Button
              className="w-full h-12 text-base font-medium"
              size="lg"
              onClick={handleStartSurvey}
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Start Survey"}
            </Button>
            <p className="text-sm text-neutral-500 text-center px-4">
              By continuing, you agree to participate in this research study.
              Your responses will be anonymized and used for academic purposes
              only.
            </p>
          </CardFooter>
        </Card>
      </main>

      <footer className="mt-8 text-center text-sm text-neutral-500">
        <p>
          © {new Date().getFullYear()} Thesis Project | Entrepreneurship
          Research
        </p>
      </footer>
    </div>
  );
}
