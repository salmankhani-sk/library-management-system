/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../UserProvider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Define a TypeScript interface for a Transaction.
interface Transaction {
  id: number;
  user: { id: number; username: string };
  book: { id: number; title: string };
  borrow_date: string;
  return_date: string | null;
  status: string;
}

export default function TransactionsList() {
  // Get the current logged-in user from the global User context.
  const { user } = useUser();
  // Get Next.js router for navigation.
  const router = useRouter();
  // State to hold the list of transactions.
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // State to manage whether the data is still loading.
  const [loading, setLoading] = useState(true);
  // State to store any error messages.
  const [error, setError] = useState<string | null>(null);

  // useEffect: on component mount or when 'user' changes,
  // if no admin user is logged in, redirect to the homepage.
  // Otherwise, fetch the transactions from the API.
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
    } else {
      fetchTransactions();
    }
  }, [user, router]);

  // Function to fetch transactions from the backend.
  const fetchTransactions = async () => {
    try {
      // Get the access token from localStorage for authorization.
      const token = localStorage.getItem("access_token");
      // Fetch transactions with the token in the Authorization header.
      const res = await fetch("http://127.0.0.1:8000/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // If the response isn't okay, parse the error and throw it.
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch transactions");
      }
      // Parse and store the response data into the transactions state.
      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      // If an error occurs, set the error message for display.
      setError(err.message);
    } finally {
      // In all cases, stop the loading indicator.
      setLoading(false);
    }
  };

  // Display a loading message if the data is still being fetched.
  if (loading)
    return (
      <div className="text-center mt-20 text-xl font-semibold text-green-800">
        Loading...
      </div>
    );
  // Display any error message if an error occurred.
  if (error)
    return (
      <div className="text-red-500 text-center mt-20 text-xl">
        {error}
      </div>
    );

  return (
    // Outer container with a gradient background for a modern look.
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page heading with a fade-in animation using Framer Motion. */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-green-800 text-center"
        >
          All Transactions
        </motion.h1>

        {/* Table container with overflow-x-auto to handle responsiveness and a card-style layout. */}
        <div className="overflow-x-auto bg-white shadow-xl rounded-lg">
          {/* Animated container for the table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-green-200">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Book</th>
                  <th className="p-4 text-left">Borrow Date</th>
                  <th className="p-4 text-left">Return Date</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gray-50 transition-all">
                    <td className="p-4">{t.id}</td>
                    <td className="p-4">{t.user.username}</td>
                    <td className="p-4">{t.book.title}</td>
                    <td className="p-4">{new Date(t.borrow_date).toLocaleDateString()}</td>
                    <td className="p-4">
                      {t.return_date ? new Date(t.return_date).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-4">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
