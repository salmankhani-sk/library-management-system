"use client";

import { useUser } from "../../UserProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [user, router]);

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Please log in to download the report.");
      }
      const response = await fetch("http://127.0.0.1:8000/admin/transactions/report", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to download report");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-semibold">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-20 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-green-800 text-center">Admin Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Link to View All Users */}
          <Link
            href="/admin/users"
            className="p-6 bg-white rounded-xl shadow-xl hover:bg-green-50 transition-all transform hover:scale-105"
          >
            <h2 className="text-xl font-semibold text-green-700">View All Users</h2>
            <p className="text-gray-600 mt-2">Manage user accounts and details.</p>
          </Link>

          {/* Link to View Transactions */}
          <Link
            href="/admin/transactions"
            className="p-6 bg-white rounded-xl shadow-xl hover:bg-green-50 transition-all transform hover:scale-105"
          >
            <h2 className="text-xl font-semibold text-green-700">View Transactions</h2>
            <p className="text-gray-600 mt-2">Track book borrowing and returns.</p>
          </Link>

          {/* Button to Download Report */}
          <button
            onClick={handleDownloadReport}
            className="p-6 bg-white rounded-xl shadow-xl hover:bg-green-50 transition-all transform hover:scale-105 text-left"
          >
            <h2 className="text-xl font-semibold text-green-700">Download Report</h2>
            <p className="text-gray-600 mt-2">Get a PDF of all transaction records.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
