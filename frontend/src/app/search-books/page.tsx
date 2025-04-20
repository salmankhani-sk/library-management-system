"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  status: string;
  thumbnail?: string;
}

export default function SearchBooks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if the user is logged in; if not, redirect to login page.
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const url = `http://127.0.0.1:8000/books/search/?query=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`Failed to search books: ${res.status}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err: any) {
      console.error("Fetch error:", err.name, err.message);
      setError(err.message || "Failed to fetch books from the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchBooks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center text-gray-800 mb-8"
        >
          Library Search
        </motion.h1>

        <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-8">
          <div className="flex gap-2">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for books..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition duration-300"
            >
              {loading ? "Searching..." : "Search"}
            </motion.button>
          </div>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg max-w-lg mx-auto"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {searchResults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {searchResults.map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden transition-shadow"
              >
                <Link href={`/books/${book.isbn}`}>
                  {book.thumbnail && (
                    <img
                      src={book.thumbnail.replace("http://", "https://")}
                      alt={book.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-800 truncate">
                      {book.title}
                    </h2>
                    <p className="text-gray-600">by {book.author}</p>
                    <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
                    <p
                      className={`mt-2 text-sm font-medium ${
                        book.status === "available" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Status: {book.status}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          !loading &&
          !error && (
            <p className="text-center text-gray-500">
              No results found. Try a different search.
            </p>
          )
        )}
      </div>
    </div>
  );
}
