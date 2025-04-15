import { UserModel } from "@/models/User";
import { LoginForm } from "./login-form";
import { AdminDashboard } from "./admin-dashboard";
import dbConnect from "@/lib/dbConnect";
import { isAdminAuthenticated } from "@/app/admin/actions";
import { TYPE_OF_TASK } from "@/types/User";

export default async function AdminPage() {
  // Connect to the database
  await dbConnect();

  // Check authentication on the server
  const isAuthenticated = await isAdminAuthenticated();

  // If authenticated, fetch users
  let users: Array<{
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
  }> = [];
  if (isAuthenticated) {
    try {
      const result = await UserModel.find({}).lean();
      // Convert MongoDB UUID objects to strings for JSON serialization
      users = result.map((user) => ({
        ...user,
        _id: user._id?.toString() || "",
        id: user.id?.toString() || "",
        accessToken: user.accessToken?.toString() || "",
        typeOfTask: user.typeOfTask || "",
        datetimeSurveyStarted: user.datetimeSurveyStarted || null,
        chatHistory: user.chatHistory || [],
        results: user.results || "",
        currentStep: user.currentStep || null,
        datetimeSurveyFinishedEarly: user.datetimeSurveyFinishedEarly || null,
      }));
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
    }
  }

  return (
    <div className="container mx-auto py-10">
      {isAuthenticated ? (
        <AdminDashboard initialUsers={users} />
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
