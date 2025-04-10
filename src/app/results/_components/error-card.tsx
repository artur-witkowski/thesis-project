"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { HomeButton } from "./home-button";

interface ErrorCardProps {
  title: string;
  description: string;
  titleColor?: string;
}

export function ErrorCard({ title, description, titleColor }: ErrorCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className={`text-center ${titleColor || ""}`}>{title}</CardTitle>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <HomeButton />
        </CardFooter>
      </Card>
    </div>
  );
}
