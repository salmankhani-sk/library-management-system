/* eslint-disable @typescript-eslint/no-explicit-any */
// Disables the ESLint rule for using "any" so that we can use err: any in our catch blocks.

"use client";
// Ensures that this component is rendered on the client side,
// which is necessary because we use browser-specific APIs like localStorage and React hooks.

import { useState, useEffect } from "react";
// Import useState to manage local state (search query, results, loading, etc.).
// Import useEffect to perform side effects, such as checking for an authentication token.

import { useRouter } from "next/navigation";
// Import useRouter for programmatic navigation (e.g., redirecting to the login page).

import Link from "next/link";
// Import the Link component from Next.js for client-side navigation between pages.

import { motion, AnimatePresence } from "framer-motion";
// Import motion components to add animations to elements.
// Import AnimatePresence to animate components as they enter/exit the React tree.

// Define a TypeScript interface for a Book object.
interface Book {
  id: number;         // Unique identifier for the book.
  title: string;      // Title of the book.
  author: string;     // Author of the book.
  isbn: string;       // ISBN number of the book.
  status: string;     // Availability status, e.g., "available" or "borrowed".
  thumbnail?: string; // Optional URL for the book's thumbnail image.
}

// Define and export the SearchBooks functional component.
export default function SearchBooks() {
  // Create a state variable "searchQuery" and its updater "setSearchQuery", 
  // used to store the user's input for searching books.
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create a state variable "searchResults" that will hold an array of Book objects (initially empty).
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  
  // Create a state variable "loading" to represent whether the search operation is in progress.
  const [loading, setLoading] = useState(false);
  
  // Create a state variable "error" to store any error messages. It can be a string or null.
  const [error, setError] = useState<string | null>(null);
  
  // Get the router instance from Next.js to allow for navigation.
  const router = useRouter();

  // useEffect hook: This runs after the component mounts.
  // Here it checks if the "access_token" exists in localStorage.
  // If it does not exist, the user is redirected to the login page.
  useEffect(() => {
    const token = localStorage.getItem("access_token"); // Retrieve the token from localStorage.
    if (!token) {
      // If token is not found, navigate (redirect) the user to the "/login" route.
      router.push("/login");
    }
  }, [router]); // This effect depends on router, so it re-runs if router changes.

  // Define an asynchronous function that will perform the API call to search for books.
  const searchBooks = async () => {
    // If the searchQuery is empty or only contains spaces, do nothing.
    if (!searchQuery.trim()) return;
    
    // Set the loading state to true to indicate a search is in progress.
    setLoading(true);
    // Clear any previous error message.
    setError(null);
    
    try {
      // Construct the URL for the search API endpoint, encoding the searchQuery as a URL parameter.
      const url = `http://127.0.0.1:8000/books/search/?query=${encodeURIComponent(searchQuery)}`;
      
      // Make a GET request to the search endpoint.
      const res = await fetch(url, { method: "GET" });
      
      // If the HTTP response is not OK (i.e., not in the 200-299 status range),
      // throw an error that will be caught in the catch block.
      if (!res.ok) throw new Error(`Failed to search books: ${res.status}`);
      
      // Parse the JSON response from the server.
      const data = await res.json();
      
      // Update the state "searchResults" with the fetched data (an array of Book objects).
      setSearchResults(data);
    } catch (err: any) {
      // Log the error details to the console for debugging.
      console.error("Fetch error:", err.name, err.message);
      // Update the error state to display an error message to the user.
      setError(err.message || "Failed to fetch books from the server.");
    } finally {
      // Whether the request succeeds or fails, set loading to false.
      setLoading(false);
    }
  };

  // Define a function to handle form submission for initiating the book search.
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission (which would reload the page).
    searchBooks();      // Call the searchBooks function to perform the search.
  };

  // Return the JSX that will be rendered on the screen.
  return (
    // Outer container that takes at least the full height of the screen,
    // applies a background gradient, and vertical padding.
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 py-8">
      {/* Container div for centering content horizontally with maximum width settings. */}
      <div className="container mx-auto px-4">
        
        {/* Animated heading using Framer Motion for a fade-in & slide-down effect. */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }} // Starting state: transparent and 20px above normal.
          animate={{ opacity: 1, y: 0 }}     // Animate to: fully visible and in normal position.
          transition={{ duration: 0.5 }}      // Duration of animation is 0.5 seconds.
          className="text-4xl font-bold text-center text-gray-800 mb-8" // Tailwind styles for size, font, text alignment, color, and margin.
        >
          Library Search {/* Heading text */}
        </motion.h1>

        {/* Form container for the search input and button, centered with maximum width applied. */}
        <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-8">
          {/* Container div for input and button with horizontal gap between them. */}
          <div className="flex gap-2">
            {/* Input field for the search query with Framer Motion animation on focus. */}
            <motion.input
              whileFocus={{ scale: 1.02 }}  // When focused, the input slightly enlarges for a dynamic effect.
              type="text"                   // Type of input is text.
              value={searchQuery}           // Bind the input value to the searchQuery state.
              onChange={(e) => setSearchQuery(e.target.value)} // Update the state whenever input value changes.
              placeholder="Search for books..." // Placeholder text shown when the field is empty.
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" // Tailwind classes for styling.
              required                   // Field must be filled out before submitting the form.
            />
            {/* Button to submit the search form with Framer Motion animations on tap and hover. */}
            <motion.button
              whileTap={{ scale: 0.97 }}   // Slightly reduce scale when the button is clicked.
              type="submit"                // This button submits the form.
              disabled={loading}           // Disable the button if the search is in progress.
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition duration-300" // Styling classes for the button.
            >
              {loading ? "Searching..." : "Search"} {/* Display "Searching..." if loading is true, otherwise "Search". */}
            </motion.button>
          </div>
        </form>

        {/* AnimatePresence allows for smooth animations on component entry and exit.
            Here it's used to animate the display of error messages. */}
        <AnimatePresence>
          {error && ( // If there's an error, display it.
            <motion.div
              initial={{ opacity: 0 }}  // Start invisible.
              animate={{ opacity: 1 }}    // Animate to fully visible.
              exit={{ opacity: 0 }}       // When removed, fade out.
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg max-w-lg mx-auto" // Tailwind styles for error message styling.
            >
              {error} {/* Render the error message text */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conditionally render search results if any exist.
            If there are results, display them in a grid layout using Framer Motion for fade in. */}
        {searchResults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}      // Start with 0 opacity.
            animate={{ opacity: 1 }}        // Animate to full opacity.
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" // Responsive grid layout: 2 columns on medium screens, 3 on large.
          >
            {/* Map over each book object in the searchResults array. */}
            {searchResults.map((book) => (
              // Each book card is wrapped in a motion.div for a hover scale animation.
              <motion.div
                key={book.id} // Unique key for React list rendering.
                whileHover={{ scale: 1.03 }} // Slightly enlarge card on hover.
                className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden transition-shadow" // Card styles for a glass-like effect, rounded corners, shadow.
              >
                {/* Link wraps the entire card so that clicking anywhere navigates to the book's details page */}
                <Link href={`/books/${book.isbn}`}>
                  {/* If a thumbnail exists for the book, display it as an image */}
                  {book.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.thumbnail.replace("http://", "https://")} // Ensure the URL is secure (HTTPS).
                      alt={book.title} // Provide alt text for accessibility using the book title.
                      className="w-full h-48 object-cover" // Styles: full width, fixed height, cover object-fit.
                    />
                  )}
                  {/* Content container within the card */}
                  <div className="p-4">
                    {/* Display the book title */}
                    <h2 className="text-xl font-semibold text-gray-800 truncate">
                      {book.title} {/* Truncate title if too long */}
                    </h2>
                    {/* Show the book's author */}
                    <p className="text-gray-600">by {book.author}</p>
                    {/* Display the book's ISBN */}
                    <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
                    {/* Conditionally style and display the book's status (available or not) */}
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
          // If there are no search results, and no error and not loading, display a fallback message.
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
