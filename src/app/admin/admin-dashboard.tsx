"use client";

import { Button } from "@/components/ui/button";
import { UserManagement } from "./user-management";
import { logoutAdmin } from "./actions";
import { TYPE_OF_TASK } from "@/types/User";
import { useRouter } from "next/navigation";

interface AdminDashboardProps {
  initialUsers: Array<{
    _id: string;
    id: string;
    accessToken: string;
    typeOfTask: (typeof TYPE_OF_TASK)[keyof typeof TYPE_OF_TASK];
    datetimeSurveyStarted: Date | null;
    chatHistory: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }>;
    results: string;
    currentStep: number | null;
    datetimeSurveyFinishedEarly: Date | null;
  }>;
}

export function AdminDashboard({ initialUsers }: AdminDashboardProps) {
  const router = useRouter();
  const handleLogout = async () => {
    await logoutAdmin();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button type="button" onClick={() => router.push("/")}>
          Go back to main page
        </Button>
        <form action={logoutAdmin}>
          <Button type="submit" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </form>
      </div>
      <UserManagement initialUsers={initialUsers} />
    </div>
  );
}
