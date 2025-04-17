"use client";

import { useState } from "react";
import Link from "next/link";

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  status: string;
  thumbnail?: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching books for query:", searchQuery);
      const url = `http://127.0.0.1:8000/books/search/?query=${encodeURIComponent(searchQuery)}`;
      console.log("Request URL:", url);
      const res = await fetch(url, { method: "GET" });
      console.log("Response status:", res.status);
      if (!res.ok) throw new Error(`Failed to search books: ${res.status}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err: any) {
      console.error("Fetch error details:", err.name, err.message);
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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Library Search</h1>

        <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for books..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg max-w-lg mx-auto">
            {error}
          </div>
        )}

        {searchResults.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((book) => (
              <Link href={`/books/${book.isbn}`} key={book.id} className="block">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {book.thumbnail && (
                    <img
                      src={book.thumbnail.replace("http://", "https://")}
                      alt={book.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-800 truncate">{book.title}</h2>
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
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !loading && !error && (
            <p className="text-center text-gray-500">No results found. Try a different search.</p>//Like here he can see the result of searches
          )
        )}
      </div>
    </div>
  );
}