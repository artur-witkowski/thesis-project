"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HomeButton } from "./home-button";
import Markdown from "react-markdown";

interface ResultsContentProps {
  results: string;
}

export function ResultsContent({ results }: ResultsContentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-xl pt-0">
          <CardHeader className="bg-primary/5 pt-8 pb-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Survey Results
                </CardTitle>
                <CardDescription>
                  Thank you for your participation
                </CardDescription>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 rounded-b-lg">
            <div className="prose dark:prose-invert max-w-none">
              <Markdown>{results}</Markdown>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Your responses have been recorded successfully. Thank you for your
              valuable input!
            </p>
            <HomeButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
