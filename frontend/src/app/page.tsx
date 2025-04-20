// Tell Next.js that this file should be rendered on the client side.
// This is required for React hooks like useState and useEffect.
"use client";

// Import React hooks: useState for managing component state, and useEffect for side effects.
import { useEffect, useState } from "react";

// Import Link from Next.js to create client-side navigable links.
import Link from "next/link";

// Import the Search icon from lucide-react icon library.
import { Search } from "lucide-react";

// Import motion from Framer Motion for adding animations to components.
import { motion } from "framer-motion";

// Export the default functional component called Home.
export default function Home() {
  // Declare a state variable 'username' that holds a string or null.
  // The setUsername function is used to update its value.
  const [username, setUsername] = useState<string | null>(null);

  // useEffect hook runs after the component mounts.
  // In this case, it checks if a user is stored in localStorage.
  useEffect(() => {
    // Retrieve the 'user' item from localStorage (it is stored as a JSON string).
    const storedUser = localStorage.getItem("user");
    // If there is any stored user, proceed to update the state.
    if (storedUser) {
      // Parse the JSON string into an object.
      const parsed = JSON.parse(storedUser);
      // Set the username state from the parsed object.
      setUsername(parsed.username);
    }
  }, []); // An empty dependency array means this effect runs only once upon component mounting.

  // Return the JSX to render the home page.
  return (
    // <main> is the primary container for the page content.
    // Apply Tailwind CSS classes:
    // - min-h-screen: Minimum height equals the screen height.
    // - bg-cover: Scale the background image so that it covers the entire container.
    // - bg-center: Center the background image.
    // - text-white: Set text color to white.
    // - px-6 py-12: Apply horizontal (px) and vertical (py) padding.
    <main
      className="min-h-screen bg-cover bg-center text-white px-6 py-12"
      // Inline style sets the background image using a file named "home-page.png" located in the public folder.
      style={{ backgroundImage: "url('/home-page.png')" }}
    >
      {/* This <div> acts as an overlay: 
          - bg-black/40 provides a semitransparent black overlay for better text contrast.
          - min-h-screen ensures it covers full screen height.
          - flex flex-col items-center justify-center centers content both horizontally and vertically. */}
      <div className="bg-black/40 min-h-screen flex flex-col items-center justify-center">
        {/* Header Section */}
        {/* A Framer Motion animated <div> that will fade in and slide upward from below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} // Initial state: 0 opacity (invisible) and shifted 20px down.
          animate={{ opacity: 1, y: 0 }} // Animate to full opacity and original position (y: 0).
          transition={{ duration: 0.6 }} // Animation will take 0.6 seconds.
          className="text-center mb-12" // Tailwind: center text and add bottom margin.
        >
          {/* Display a welcome heading. 
              If 'username' is present, show the username; otherwise, display "to AgriLibrary". */}
          <h1 className="text-5xl font-bold text-green-200 drop-shadow-md">
            Welcome {username ? username : "to AgriLibrary"}! 🌱
          </h1>
          {/* A paragraph under the heading that describes the application.
              mt-4: margin top, text-lg: large text, max-w-xl: max width extra large, mx-auto: center horizontally */}
          <p className="mt-4 text-lg text-green-100 max-w-xl mx-auto">
            Explore a vast collection of books tailored for agriculture, botany, and environmental science.
          </p>
        </motion.div>

        {/* Search Books Section */}
        {/* Another Framer Motion <div> with scale and fade animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} // Initially, this section is slightly scaled down and transparent.
          animate={{ opacity: 1, scale: 1 }} // Animate to fully visible and at full scale.
          transition={{ delay: 0.4, duration: 0.5 }} // Delay animation start by 0.4 seconds and run animation over 0.5 seconds.
          className="bg-white/60 backdrop-blur-md border border-green-300 p-6 rounded-xl shadow-lg text-center max-w-sm w-full"
          // Tailwind:
          // bg-white/60: white background with 60% opacity.
          // backdrop-blur-md: moderate blur effect on background behind this div.
          // border border-green-300: green border.
          // p-6: padding, rounded-xl: rounded corners.
          // shadow-lg: large shadow effect.
          // text-center: center align text.
          // max-w-sm: maximum width small, w-full: full width.
        >
          {/* Render the Search icon imported from lucide-react, centered horizontally */}
          <Search className="mx-auto text-green-600" size={36} />
          {/* Section title for the search functionality */}
          <h3 className="text-xl font-semibold text-green-800 mt-4">Search Books</h3>
          {/* Subtext description */}
          <p className="text-green-700 mt-2">Find books by title, author, or category.</p>
          {/* Create a navigational link to the search books page */}
          <Link href="/search-books">
            {/* Button element with Tailwind classes for margin, padding, background, rounded corners, and hover transition */}
            <button className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Start Searching
            </button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
