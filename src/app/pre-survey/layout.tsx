"use client";

import { verifyAccessToken } from "@/lib/verifyAccessToken";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PreSurveyLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyToken() {
      setIsLoading(true);
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
      } catch (error) {
        console.error("Error verifying token:", error);
        router.replace("/");
      }
      setIsLoading(false);
    }

    verifyToken();
  }, [token, router, setIsLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-screen">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default function PreSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      }
    >
      <PreSurveyLayoutContent>{children}</PreSurveyLayoutContent>
    </Suspense>
  );
}
