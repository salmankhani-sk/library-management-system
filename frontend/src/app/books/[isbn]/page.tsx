// frontend/src/app/books/[isbn]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface BookDetailInfo {
  title: string;
  authors: string[];
  industryIdentifiers: { type: string; identifier: string }[];
  imageLinks?: { thumbnail: string };
}

export default function BookDetail() {
  const { isbn } = useParams();
  const [book, setBook] = useState<BookDetailInfo | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isbn) return;
    fetchBookDetails(isbn as string);
    fetchBookStatus(isbn as string);
  }, [isbn]);

  const fetchBookDetails = async (isbn: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );
      if (!response.ok) throw new Error(`Failed to fetch book details: ${response.status}`);
      const data = await response.json();
      if (data.totalItems === 0) throw new Error("No book found with the provided ISBN.");
      setBook(data.items[0].volumeInfo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookStatus = async (isbn: string) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/books/");
      if (!res.ok) throw new Error(`Status fetch failed: ${res.status}`);
      const allBooks = await res.json();
      const found = allBooks.find((b: any) => b.isbn === isbn);
      setStatus(found ? found.status : "available");
    } catch (err: any) {
      setActionError("Could not load book status.");
    }
  };

  const updateStatus = async (newStatus: "available" | "borrowed") => {
    setActionLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Please log in to perform this action.");
      }
      const res = await fetch(
        `http://127.0.0.1:8000/books/${isbn}/status?status=${newStatus}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to update book status");
      }
      await res.json();
      setStatus(newStatus);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBorrow = () => updateStatus("borrowed");
  const handleReturn = () => updateStatus("available");

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Book Details</h1>
        {book && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3">
                {book.imageLinks?.thumbnail ? (
                  <img
                    src={book.imageLinks.thumbnail}
                    alt={book.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    No Image
                  </div>
                )}
              </div>
              <div className="md:w-2/3 p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">{book.title}</h2>
                <p className="text-gray-600 mb-2">
                  Author(s): {book.authors?.join(", ") || "Unknown"}
                </p>
                <p className="text-gray-600 mb-4">
                  ISBN: {book.industryIdentifiers?.map((id) => id.identifier).join(", ") || "N/A"}
                </p>
                <p className="text-gray-700 mb-4">
                  Status: <span className={status === "available" ? "text-green-600" : "text-red-600"}>{status}</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleBorrow}
                    disabled={actionLoading || status === "borrowed"}
                    className={`flex-1 py-2 rounded-lg text-white ${
                      status === "borrowed" ? "bg-gray-300" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {actionLoading && status !== "borrowed" ? "Processing..." : "Borrow"}
                  </button>
                  <button
                    onClick={handleReturn}
                    disabled={actionLoading || status === "available"}
                    className={`flex-1 py-2 rounded-lg text-white ${
                      status === "available" ? "bg-gray-300" : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {actionLoading && status !== "available" ? "Processing..." : "Return"}
                  </button>
                </div>
                {actionError && <p className="mt-2 text-red-500">{actionError}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}