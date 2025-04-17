// frontend/src/app/admin/transactions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../UserProvider";
import { useRouter } from "next/navigation";

interface Transaction {
  id: number;
  user: { id: number; username: string };
  book: { id: number; title: string };
  borrow_date: string;
  return_date: string | null;
  status: string;
}

export default function TransactionsList() {
  const { user } = useUser();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
    } else {
      fetchTransactions();
    }
  }, [user, router]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch transactions");
      }
      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-20">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-800">All Transactions</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-green-200">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Book</th>
              <th className="p-3 text-left">Borrow Date</th>
              <th className="p-3 text-left">Return Date</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{t.id}</td>
                <td className="p-3">{t.user.username}</td>
                <td className="p-3">{t.book.title}</td>
                <td className="p-3">{new Date(t.borrow_date).toLocaleDateString()}</td>
                <td className="p-3">{t.return_date ? new Date(t.return_date).toLocaleDateString() : "N/A"}</td>
                <td className="p-3">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}