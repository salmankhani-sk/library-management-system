/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  status: string;
}

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userId, setUserId] = useState<number | null>(null);
  const [bookTransactions, setBookTransactions] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchBooksAndTransactions = async () => {
      try {
        const token = localStorage.getItem("access_token") || localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view books");
          router.push("/login");
          return;
        }

        const decoded = JSON.parse(atob(token.split(".")[1]));
        const currentUserId: number = decoded.sub || decoded.id;
        setUserId(currentUserId);

        // Fetch all books
        const booksResponse = await axios.get<Book[]>("http://localhost:8000/books/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const booksData = booksResponse.data;
        setBooks(booksData);

        // Fetch transaction status for borrowed books
        const transactions: Record<string, boolean> = {};
        for (const book of booksData) {
          if (book.status === "borrowed") {
            try {
              const transactionResponse = await axios.get<{
                has_active_transaction: boolean;
                transaction_id: number | null;
              }>(`http://localhost:8000/books/${book.isbn}/transaction`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              transactions[book.isbn] = transactionResponse.data.has_active_transaction;
            } catch (err) {
              transactions[book.isbn] = false;
              console.error(`Failed to fetch transaction for ISBN ${book.isbn}:`, err);
            }
          }
        }
        setBookTransactions(transactions);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch books");
        setLoading(false);
      }
    };

    fetchBooksAndTransactions();
  }, [router]);

  const handleBorrow = async (isbn: string) => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const payload = { isbn };
      console.log("Borrow payload:", payload);
      const response = await axios.post(
        "http://localhost:8000/books/borrow",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Borrow response:", response.data);
      setBooks(books.map((b) => (b.isbn === isbn ? { ...b, status: "borrowed" } : b)));
      setBookTransactions({ ...bookTransactions, [isbn]: true });
      alert("Book borrowed successfully!");
      router.push(`/books/${isbn}`);
    } catch (err: any) {
      console.error("Borrow error:", err.response?.data);
      alert(err.response?.data?.detail || "Failed to borrow book");
    }
  };

  const handleReturn = async (isbn: string) => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const payload = { isbn };
      console.log("Return payload:", payload);
      const response = await axios.post(
        "http://localhost:8000/books/return",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Return response:", response.data);
      setBooks(books.map((b) => (b.isbn === isbn ? { ...b, status: "available" } : b)));
      setBookTransactions({ ...bookTransactions, [isbn]: false });
      alert("Book returned successfully!");
    } catch (err: any) {
      console.error("Return error:", err.response?.data);
      alert(err.response?.data?.detail || "Failed to return book");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">All Books</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.isbn}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{book.title}</h2>
              <p className="text-gray-600 text-sm mb-1">Author: {book.author}</p>
              <p className="text-gray-600 text-sm mb-1">ISBN: {book.isbn}</p>
              <p className="text-gray-600 text-sm mb-4">
                Status: <span className={book.status === "available" ? "text-blue-600" : "text-red-600"}>{book.status}</span>
                {book.status === "borrowed" && !bookTransactions[book.isbn] && (
                  <span className="text-red-500 text-sm"> (by another user)</span>
                )}
              </p>
              <div className="flex flex-col gap-2">
                {book.status === "available" ? (
                  <button
                    onClick={() => handleBorrow(book.isbn)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                  >
                    Borrow
                  </button>
                ) : bookTransactions[book.isbn] ? (
                  <button
                    onClick={() => handleReturn(book.isbn)}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                  >
                    Return
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed text-sm font-medium"
                  >
                    Return
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BooksPage;