//frontend/src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Search, LogOut } from "lucide-react";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUsername(parsed.username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    setUsername(null);
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-green-50 to-green-100 p-6">
      
      <section className="text-center mt-20">
        <h2 className="text-4xl font-bold mb-4 text-green-800">
          Welcome {username ? `${username}` : "to AgriLibrary"}! 🌱
        </h2>
        <p className="text-lg text-green-700">
          Explore a vast collection of books tailored for agriculture, botany, and more.
        </p>
        <div className="mt-8">
          <Link
            href="/search-books"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
          >
            Start Exploring
          </Link>
        </div>
      </section>
    </main>
  );
}
