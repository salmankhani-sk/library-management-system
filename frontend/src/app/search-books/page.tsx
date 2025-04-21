/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/search-books/page.tsx

"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  status: string;
  thumbnail?: string;
}

export default function SearchBooks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log searchResults to debug duplicate IDs or ISBNs
  useEffect(() => {
    console.log("searchResults:", searchResults);
    // Check for duplicate IDs
    const idCounts = searchResults.reduce((acc, book) => {
      acc[book.id] = (acc[book.id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    const idDuplicates = Object.entries(idCounts).filter(([_, count]) => count > 1);
    if (idDuplicates.length > 0) {
      console.warn("Duplicate IDs found:", idDuplicates);
    }
    // Check for duplicate ISBNs
    const isbnCounts = searchResults.reduce((acc, book) => {
      acc[book.isbn] = (acc[book.isbn] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const isbnDuplicates = Object.entries(isbnCounts).filter(([_, count]) => count > 1);
    if (isbnDuplicates.length > 0) {
      console.warn("Duplicate ISBNs found:", isbnDuplicates);
    }
  }, [searchResults]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term.");
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/books/search/?query=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while searching.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-4xl font-bold text-center text-gray-800 mb-10"
        >
          Search Books
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for books..."
              className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={loading}
              className={`px-6 py-3 rounded-lg text-white font-medium ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? "Searching..." : "Search"}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center text-red-500 mb-6"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full mx-auto"
            />
            <p className="mt-4 text-gray-600">Loading...</p>
          </motion.div>
        ) : searchResults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {searchResults.map((book) => (
              <motion.div
                key={`${book.id}-${book.isbn}`} // Combine id and isbn for maximum uniqueness
                whileHover={{ scale: 1.03 }}
                className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden transition-shadow"
              >
                <Link href={`/books/${book.isbn}`}>
                  {book.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-600"
          >
            No books found. Try a different search term.
          </motion.p>
        )}
      </div>
    </div>
  );
}