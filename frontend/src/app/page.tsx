"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUsername(parsed.username);
    }
  }, []);

  return (
    <main
      className="min-h-screen bg-cover bg-center text-white px-6 py-12"
      style={{ backgroundImage: "url('/home-page.png')" }}
    >
      <div className="bg-black/40 min-h-screen flex flex-col items-center justify-center">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-green-200 drop-shadow-md">
            Welcome {username ? username : "to AgriLibrary"}! 🌱
          </h1>
          <p className="mt-4 text-lg text-green-100 max-w-xl mx-auto">
            Explore a vast collection of books tailored for agriculture, botany, and environmental science.
          </p>
        </motion.div>

        {/* Search Books Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/60 backdrop-blur-md border border-green-300 p-6 rounded-xl shadow-lg text-center max-w-sm w-full"
        >
          <Search className="mx-auto text-green-600" size={36} />
          <h3 className="text-xl font-semibold text-green-800 mt-4">Search Books</h3>
          <p className="text-green-700 mt-2">Find books by title, author, or category.</p>
          <Link href="/search-books">
            <button className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Start Searching
            </button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
