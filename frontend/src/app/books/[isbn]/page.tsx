/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface BookDetailInfo {
  title: string;
  authors: string[];
  industryIdentifiers: { type: string; identifier: string }[];
  imageLinks?: { thumbnail: string };
}

export default function BookDetail() {
  const { isbn } = useParams();
  const router = useRouter();
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
      const res = await fetch(`http://127.0.0.1:8000/books/${isbn}`);
      if (!res.ok) {
        if (res.status === 404) {
          setStatus("available"); // Default to available if not in database
        } else {
          throw new Error(`Status fetch failed: ${res.status}`);
        }
      } else {
        const book = await res.json();
        setStatus(book.status);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: any) {
      setActionError("Could not load book status.");
      setStatus("available");
    }
  };

  const handleBorrow = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Please log in to perform this action.");
      }
      const isbnToUse = book?.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier ||
                        book?.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier || isbn;
      console.log("Borrow payload:", { isbn: isbnToUse });
      const res = await fetch(`http://127.0.0.1:8000/books/borrow`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isbn: isbnToUse }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to borrow book");
      }
      await res.json();
      setStatus("borrowed");
      router.push(`/books/${isbnToUse}`); // Redirect to book details
    } catch (err: any) {
      console.error("Borrow error:", err);
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Please log in to perform this action.");
      }
      const isbnToUse = book?.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier ||
                        book?.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier || isbn;
      console.log("Return payload:", { isbn: isbnToUse });
      const res = await fetch(`http://127.0.0.1:8000/books/return`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isbn: isbnToUse }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to return book");
      }
      await res.json();
      setStatus("available");
    } catch (err: any) {
      console.error("Return error:", err);
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Loading Book Details...</h2>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full mx-auto"
          ></motion.div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="text-red-500 text-center text-lg font-medium"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-4xl font-bold text-center text-gray-800 mb-10"
        >
          Book Details
        </motion.h1>
        {book && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3">
                {book.imageLinks?.thumbnail ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeIn" }}
                    src={book.imageLinks.thumbnail}
                    alt={book.title}
                    className="w-full h-80 md:h-full object-cover"
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeIn" }}
                    className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 font-medium"
                  >
                    No Image
                  </motion.div>
                )}
              </div>
              <div className="md:w-2/3 p-6">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                  className="text-2xl font-semibold text-gray-800 mb-3"
                >
                  {book.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                  className="text-gray-600 mb-2"
                >
                  Author(s): {book.authors?.join(", ") || "Unknown"}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                  className="text-gray-600 mb-4"
                >
                  ISBN: {book.industryIdentifiers?.map((id) => id.identifier).join(", ") || "N/A"}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                  className="text-gray-700 mb-4"
                >
                  Status: <span className={status === "available" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{status}</span>
                </motion.p>
                <div className="flex gap-3">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                    onClick={handleBorrow}
                    disabled={actionLoading || status === "borrowed"}
                    className={`flex-1 py-2 rounded-lg text-white font-medium transition-colors duration-300 ${
                      status === "borrowed" ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    whileHover={{ scale: status === "borrowed" ? 1 : 1.05 }}
                    whileTap={{ scale: status === "borrowed" ? 1 : 0.95 }}
                  >
                    {actionLoading && status !== "borrowed" ? "Processing..." : "Borrow"}
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                    onClick={handleReturn}
                    disabled={actionLoading || status === "available"}
                    className={`flex-1 py-2 rounded-lg text-white font-medium transition-colors duration-300 ${
                      status === "available" ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                    }`}
                    whileHover={{ scale: status === "available" ? 1 : 1.05 }}
                    whileTap={{ scale: status === "available" ? 1 : 0.95 }}
                  >
                    {actionLoading && status !== "available" ? "Processing..." : "Return"}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {actionError && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 text-red-500 text-sm"
                    >
                      {actionError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


// /* eslint-disable @typescript-eslint/no-explicit-any */

// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";

// interface BookDetailInfo {
//   title: string;
//   authors: string[];
//   industryIdentifiers: { type: string; identifier: string }[];
//   imageLinks?: { thumbnail: string };
// }

// export default function BookDetail() {
//   const { isbn } = useParams();
//   const [book, setBook] = useState<BookDetailInfo | null>(null);
//   const [status, setStatus] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [actionError, setActionError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!isbn) return;
//     fetchBookDetails(isbn as string);
//     fetchBookStatus(isbn as string);
//   }, [isbn]);

//   const fetchBookDetails = async (isbn: string) => {
//     try {
//       const response = await fetch(
//         `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
//       );
//       if (!response.ok) throw new Error(`Failed to fetch book details: ${response.status}`);
//       const data = await response.json();
//       if (data.totalItems === 0) throw new Error("No book found with the provided ISBN.");
//       setBook(data.items[0].volumeInfo);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBookStatus = async (isbn: string) => {
//     try {
//       // Use the new GET /books/{isbn} endpoint to fetch status.
//       const res = await fetch(`http://127.0.0.1:8000/books/${isbn}`);
//       if (!res.ok) {
//         if (res.status === 404) {
//           setStatus("available"); // Default to available if not in database.
//         } else {
//           throw new Error(`Status fetch failed: ${res.status}`);
//         }
//       } else {
//         const book = await res.json();
//         setStatus(book.status);
//       }
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (err: any) {
//       setActionError("Could not load book status.");
//       setStatus(null);
//     }
//   };

//   const updateStatus = async (newStatus: "available" | "borrowed") => {
//     setActionLoading(true);
//     setActionError(null);
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         throw new Error("Please log in to perform this action.");
//       }
//       // Prefer ISBN-13, fall back to ISBN-10.
//       const isbnToUse = book?.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier ||
//                         book?.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier || isbn;
//       console.log("Using ISBN for borrow:", isbnToUse);
//       const res = await fetch(
//         `http://127.0.0.1:8000/books/${isbnToUse}/status?status=${newStatus}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.detail || "Failed to update book status");
//       }
//       await res.json();
//       setStatus(newStatus);
//     } catch (err: any) {
//       setActionError(err.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleBorrow = () => updateStatus("borrowed");
//   const handleReturn = () => updateStatus("available");

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
//           className="text-center"
//         >
//           <h2 className="text-2xl font-semibold text-gray-700 mb-4">Loading Book Details...</h2>
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//             className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full mx-auto"
//           ></motion.div>
//         </motion.div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
//           className="text-red-500 text-center text-lg font-medium"
//         >
//           {error}
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="container mx-auto px-4">
//         <motion.h1
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, ease: "easeOut" }}
//           className="text-4xl font-bold text-center text-gray-800 mb-10"
//         >
//           Book Details
//         </motion.h1>
//         {book && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
//             className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
//           >
//             <div className="flex flex-col md:flex-row">
//               <div className="md:w-1/3">
//                 {book.imageLinks?.thumbnail ? (
//                   <motion.img
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.5, ease: "easeIn" }}
//                     src={book.imageLinks.thumbnail}
//                     alt={book.title}
//                     className="w-full h-80 md:h-full object-cover"
//                   />
//                 ) : (
//                   <motion.div
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.5, ease: "easeIn" }}
//                     className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 font-medium"
//                   >
//                     No Image
//                   </motion.div>
//                 )}
//               </div>
//               <div className="md:w-2/3 p-6">
//                 <motion.h2
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
//                   className="text-2xl font-semibold text-gray-800 mb-3"
//                 >
//                   {book.title}
//                 </motion.h2>
//                 <motion.p
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
//                   className="text-gray-600 mb-2"
//                 >
//                   Author(s): {book.authors?.join(", ") || "Unknown"}
//                 </motion.p>
//                 <motion.p
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
//                   className="text-gray-600 mb-4"
//                 >
//                   ISBN: {book.industryIdentifiers?.map((id) => id.identifier).join(", ") || "N/A"}
//                 </motion.p>
//                 <motion.p
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
//                   className="text-gray-700 mb-4"
//                 >
//                   Status: <span className={status === "available" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{status}</span>
//                 </motion.p>
//                 <div className="flex gap-3">
//                   <motion.button
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
//                     onClick={handleBorrow}
//                     disabled={actionLoading || status === "borrowed"}
//                     className={`flex-1 py-2 rounded-lg text-white font-medium transition-colors duration-300 ${
//                       status === "borrowed" ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
//                     }`}
//                     whileHover={{ scale: status === "borrowed" ? 1 : 1.05 }}
//                     whileTap={{ scale: status === "borrowed" ? 1 : 0.95 }}
//                   >
//                     {actionLoading && status !== "borrowed" ? "Processing..." : "Borrow"}
//                   </motion.button>
//                   <motion.button
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
//                     onClick={handleReturn}
//                     disabled={actionLoading || status === "available"}
//                     className={`flex-1 py-2 rounded-lg text-white font-medium transition-colors duration-300 ${
//                       status === "available" ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
//                     }`}
//                     whileHover={{ scale: status === "available" ? 1 : 1.05 }}
//                     whileTap={{ scale: status === "available" ? 1 : 0.95 }}
//                   >
//                     {actionLoading && status !== "available" ? "Processing..." : "Return"}
//                   </motion.button>
//                 </div>
//                 <AnimatePresence>
//                   {actionError && (
//                     <motion.p
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: 10 }}
//                       transition={{ duration: 0.3 }}
//                       className="mt-2 text-red-500 text-sm"
//                     >
//                       {actionError}
//                     </motion.p>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }