// frontend/src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../UserProvider"; // Correct path
import Link from "next/link";

export default function LoginPage() {
  const { setUser } = useUser();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only redirect if user is actively logged in
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    if (user && token) {
      // Optionally verify token with backend (not implemented here for simplicity)
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Login failed");
      }

      const data = await res.json();

      // Store user, userId, and token in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("access_token", data.access_token);

      // Update user context
      setUser(data.user);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Login</h1>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 transition"
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}