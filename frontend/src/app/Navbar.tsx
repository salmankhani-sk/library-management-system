"use client";

import { useUser } from "./UserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="bg-green-100 px-6 py-4 shadow-md mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-700">
          <Link href="/">📚 AgriLibrary</Link>
        </h1>
        <nav className="flex gap-4 items-center">
          <Link href="/search-books" className="flex items-center gap-1 text-green-800 hover:underline">
            <BookOpen size={20} />
            Browse Books
          </Link>
          {mounted && user && user.role === "admin" && (
            <Link href="/admin/dashboard" className="text-green-800 hover:underline">
              Admin Dashboard
            </Link>
          )}
          {mounted ? (
            user ? (
              <>
                <span className="text-green-900 font-semibold">Hi, {user.username}</span>
                <button onClick={handleLogout} className="text-red-500 hover:underline flex items-center gap-1">
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="text-green-800 hover:underline">
                Login
              </Link>
            )
          ) : (
            <Link href="/login" className="text-green-800 hover:underline">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}