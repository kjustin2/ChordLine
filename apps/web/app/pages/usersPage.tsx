"use client";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useApi } from "@/lib/useApi";

export default function UsersPage() {
  const { apiAuthed } = useApi();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const data = await apiAuthed<any[]>("/v1/users");
      if (data) setUsers(data);
    }
    fetchUsers();
  }, [apiAuthed]);

  return (
    <div className="p-4">
      <SignedOut><SignInButton /></SignedOut>
      <SignedIn>
        <h1 className="text-2xl font-semibold mb-4">Users</h1>
        <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(users, null, 2)}</pre>
      </SignedIn>
    </div>
  );
}
