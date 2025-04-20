// Specify that this file should be rendered on the client side.
"use client";

// Import the custom hook 'useUser' from the UserProvider component.
// This hook provides access to the user state and a function to update it.
import { useUser } from "./UserProvider";

// Import Next.js's useRouter hook for programmatic navigation.
import { useRouter } from "next/navigation";

// Import the Link component from Next.js to create client-side navigable links.
import Link from "next/link";

// Import React hooks for managing state and side effects.
import { useEffect, useState } from "react";

// Import BookOpen and LogOut icons from the lucide-react icon library.
import { BookOpen, LogOut } from "lucide-react";

// Define and export the Navbar functional component.
export default function Navbar() {
  // Destructure 'user' and 'setUser' from the useUser hook.
  // 'user' holds the current user's information and 'setUser' is a function to update that state.
  const { user, setUser } = useUser();
  
  // Get the router object to enable navigation using router.push().
  const router = useRouter();
  
  // Create a state variable 'mounted' to track if the component has mounted.
  // This is sometimes useful to prevent mismatch issues between server-side rendering and client-side behavior.
  const [mounted, setMounted] = useState(false);

  // useEffect hook that runs only once on component mount.
  // Once the component mounts, 'mounted' is set to true.
  useEffect(() => {
    setMounted(true);
  }, []); // Empty dependency array means this effect runs only once.

  // Define a function to handle logging out the user.
  const handleLogout = () => {
    // Remove the 'user' item from localStorage, effectively clearing the stored user data.
    localStorage.removeItem("user");
    // Also remove the 'access_token' to clear authentication.
    localStorage.removeItem("access_token");
    // Update the user context to null to reflect that no user is logged in.
    setUser(null);
    // Programmatically navigate the user to the login page.
    router.push("/login");
  };

  // Return the JSX that renders the Navbar.
  return (
    // Render a <header> element with Tailwind CSS classes for background color, padding, shadow, and margin.
    <header className="bg-green-100 px-6 py-4 shadow-md mb-6">
      {/* Create a container <div> that spaces out its children on opposite ends (flex with justify-between) */}
      <div className="flex items-center justify-between">
        {/* 
            Render the logo/title of your app as an <h1> element.
            It uses Tailwind classes for font size, weight, and color.
            The title is wrapped in a Link so clicking it navigates to the homepage ("/").
        */}
        <h1 className="text-3xl font-bold text-green-700">
          <Link href="/">📚 AgriLibrary</Link>
        </h1>
        {/* 
            Render the navigation area as a <nav> element.
            It uses Tailwind to space items out horizontally.
        */}
        <nav className="flex gap-4 items-center">
          {/* 
              Link to the search-books page.
              The Link wraps a flex container combining the BookOpen icon and the text.
              It uses Tailwind for layout, text color, and hover styles.
          */}
          <Link href="/search-books" className="flex items-center gap-1 text-green-800 hover:underline">
            <BookOpen size={20} /> {/* The icon displays a book symbol */}
            Browse Books {/* Text label for the navigation link */}
          </Link>
          {/* 
              Conditionally render the "Admin Dashboard" link.
              This link is displayed only if the component has mounted, and if there is a user whose role is "admin".
          */}
          {mounted && user && user.role === "admin" && (
            <Link href="/admin/dashboard" className="text-green-800 hover:underline">
              Admin Dashboard
            </Link>
          )}
          {/* 
              Conditional rendering: show either the logged-in user greeting with a logout button,
              or a link to the login page if the user is not authenticated.
              We check if the component is mounted first to avoid server/client rendering mismatches.
          */}
          {mounted ? (
            user ? (  // If a user is logged in...
              <>
                {/* Display a greeting using the user's username */}
                <span className="text-green-900 font-semibold">Hi, {user.username}</span>
                {/* 
                    Render a logout button.
                    When clicked, it calls the handleLogout function to log out the user.
                    The button uses Tailwind for text color, hover style, and layout.
                */}
                <button onClick={handleLogout} className="text-red-500 hover:underline flex items-center gap-1">
                  <LogOut size={18} /> {/* Logout icon */}
                  Logout {/* Button text */}
                </button>
              </>
            ) : (
              // If no user is logged in, show a link to the login page.
              <Link href="/login" className="text-green-800 hover:underline">
                Login
              </Link>
            )
          ) : (
            // If the component is not yet mounted, default to showing the login link.
            <Link href="/login" className="text-green-800 hover:underline">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
