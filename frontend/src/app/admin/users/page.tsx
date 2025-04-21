"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../UserProvider";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export default function UsersList() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
    } else {
      fetchUsers();
    }
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-semibold">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-20 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-green-800 text-center">All Users</h1>

        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-green-200">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Username</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50 transition-all">
                  <td className="p-4">{user.id}</td>
                  <td className="p-4">{user.username}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
