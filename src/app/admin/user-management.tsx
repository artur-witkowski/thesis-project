"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addUser, deleteUser } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, TYPE_OF_TASK } from "@/types/User";

interface UserManagementProps {
  initialUsers: User[];
}

export function UserManagement({ initialUsers }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<
    (typeof TYPE_OF_TASK)[keyof typeof TYPE_OF_TASK]
  >(TYPE_OF_TASK.NO_AI);

  const handleAddUser = async () => {
    setIsAddingUser(true);
    setError(null);

    try {
      const result = await addUser({ typeOfTask: selectedTask });

      if (result.success && result.user) {
        // Add the new user to the local state
        // Note: This is a simplified approach - in a real app you'd want to get the full user object
        setUsers((prevUsers) => [
          ...prevUsers,
          {
            id: result.user.id,
            accessToken: result.user.accessToken,
            typeOfTask: selectedTask,
            datetimeSurveyStarted: null,
            chatHistory: [],
            results: "",
          },
        ]);
      } else {
        setError(result.error || "Failed to add user");
      }
    } catch (err) {
      setError("An error occurred while adding a user");
      console.error(err);
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setError(null);

    try {
      const formData = new FormData();
      formData.append("userId", userId);

      const result = await deleteUser(formData);

      if (result.success) {
        // Remove the deleted user from the local state
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } else {
        setError(result.error || "Failed to delete user");
      }
    } catch (err) {
      setError("An error occurred while deleting the user");
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage users for the survey system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Select
            value={selectedTask}
            onValueChange={(value) =>
              setSelectedTask(
                value as (typeof TYPE_OF_TASK)[keyof typeof TYPE_OF_TASK]
              )
            }
            name="task"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TYPE_OF_TASK).map((task) => (
                <SelectItem key={task} value={task}>
                  {task}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddUser} disabled={isAddingUser}>
            {isAddingUser ? "Adding..." : "Add New User"}
          </Button>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Access Token</TableHead>
                <TableHead>Type of Task</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No users found. Add a new user to get started.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs">
                      {user.id}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.accessToken}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.typeOfTask}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
