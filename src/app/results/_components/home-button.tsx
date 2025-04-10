"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface HomeButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export function HomeButton({ variant = "outline", className }: HomeButtonProps) {
  const router = useRouter();
  
  return (
    <Button 
      variant={variant} 
      className={className}
      onClick={() => router.push("/")}
    >
      Return to Home
    </Button>
  );
}
