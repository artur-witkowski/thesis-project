"use server";

import { UserModel } from "@/models/User";
import { UUID } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  setAuthCookie,
  removeAuthCookie,
  getIsAuthenticated,
} from "@/lib/auth";

// Check if the provided password matches the admin password and create a session
export async function loginAdmin(password: string) {
  const storedPassword = process.env.ADMIN_PASSWORD;

  if (!storedPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is not set");
  }

  if (password === storedPassword) {
    // Create admin session with JWT
    await setAuthCookie("admin-session", {
      role: "admin",
      timestamp: Date.now(),
    });
    return { success: true };
  }

  return { success: false, error: "Invalid password" };
}

// Logout by removing the session cookie
export async function logoutAdmin() {
  removeAuthCookie("admin-session");
  redirect("/admin");
}

// Check if the user is authenticated
export async function isAdminAuthenticated() {
  return getIsAuthenticated("admin-session");
}

// Add a new user
export async function addUser({ typeOfTask }: { typeOfTask: string }) {
  try {
    // Generate a random ID and access token
    const id = new UUID();
    const accessToken = new UUID();

    const newUser = new UserModel({
      id,
      accessToken,
      typeOfTask,
    });

    await newUser.save();
    revalidatePath("/admin");

    return {
      success: true,
      user: { id: id.toString(), accessToken: accessToken.toString() },
    };
  } catch (error) {
    console.error("Error adding user:", error);
    return { success: false, error: "Failed to add user" };
  }
}

// Delete a user
export async function deleteUser(formData: FormData) {
  try {
    const userId = formData.get("userId") as string;

    await UserModel.findOneAndDelete({ id: new UUID(userId) });
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
