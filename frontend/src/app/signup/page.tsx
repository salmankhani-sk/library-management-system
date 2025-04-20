/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client" tells Next.js that this component should be rendered on the client side
"use client";

// Import the useState hook from React to manage local component state (e.g., form fields, error messages)
import { useState } from "react";

// Import useRouter from Next.js for programmatic navigation (redirecting the user)
import { useRouter } from "next/navigation";

// Import motion and AnimatePresence from Framer Motion to create animations for our components
import { motion, AnimatePresence } from "framer-motion";

// Define and export the Signup functional component as the default export of this file
export default function Signup() {
  // Get the router instance from useRouter to allow redirection (e.g., sending the user to the login page after signup)
  const router = useRouter();

  // Create state variables for the form inputs and messages:
  // username: holds the user's input for their username (initially an empty string)
  const [username, setUsername] = useState("");
  // email: holds the user's input for their email address (initially an empty string)
  const [email, setEmail] = useState("");
  // password: holds the user's input for their password (initially an empty string)
  const [password, setPassword] = useState("");
  // role: holds the user's selected role; default is "user" (could also be "admin")
  const [role, setRole] = useState("user");
  // error: stores any error message from a failed signup request; can be a string or null initially
  const [error, setError] = useState<string | null>(null);
  // message: stores any success message from a successful signup, also a string or null initially
  const [message, setMessage] = useState<string | null>(null);
  // loading: a boolean that tracks whether a signup request is currently in progress; initial value is false
  const [loading, setLoading] = useState(false);

  // Define an asynchronous function to handle the signup form submission
  const handleSignup = async (e: React.FormEvent) => {
    // Prevent the default form submission behavior (page reload)
    e.preventDefault();
    // Clear any previous error or success messages before making a new request
    setError(null);
    setMessage(null);
    // Set loading state to true so the UI can reflect that a network request is in progress
    setLoading(true);
    try {
      // Make an HTTP POST request to the backend signup endpoint with the form data
      const res = await fetch("http://127.0.0.1:8000/auth/signup", {
        // Use the POST method because we are creating a new resource (user)
        method: "POST",
        // Set the header to inform the server that the request body is in JSON format
        headers: { "Content-Type": "application/json" },
        // Convert the form data into a JSON string for sending in the request body
        body: JSON.stringify({ username, email, password, role }),
      });

      // If the HTTP response is not OK (i.e., status is not 200-299), then throw an error
      if (!res.ok) {
        // Retrieve error details from the response (parsed as JSON)
        const errData = await res.json();
        // Throw a new error with a detailed message from the backend or a default message
        throw new Error(errData.detail || "Signup failed");
      }

      // Parse the JSON response data from the server
      const data = await res.json();
      // Set the success message from the server response into state (so that it can be shown to the user)
      setMessage(data.message);
      // Clear the form fields by resetting them to empty strings (or default values)
      setUsername("");
      setEmail("");
      setPassword("");
      // Optionally reset the role to default "user"
      setRole("user");
      // Redirect the user to the login page using the router after a successful signup
      router.push("/login");
    } catch (err: any) {
      // If an error occurs, log the error message and update the error state so it can be displayed to the user
      setError(err.message);
    } finally {
      // Regardless of success or error, set loading to false to indicate that the network request has completed
      setLoading(false);
    }
  };

  // The component's returned JSX that defines the UI
  return (
    // The outermost <div> creates a full-screen container:
    // min-h-screen: sets minimum height to full screen,
    // bg-cover: scales background image to cover container,
    // bg-center: centers background image,
    // flex, items-center, justify-center: center content both vertically and horizontally,
    // px-4: horizontal padding.
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      // Inline style sets the background image for this page using the file '/auth-login.png' from public folder.
      style={{ backgroundImage: "url('/auth-login.png')" }}
    >
      {/* The motion.div from Framer Motion provides animated transitions:
          initial: starting state (invisible and slightly shifted up),
          animate: target state (fully visible in its final position),
          transition: animation timing details.
          The CSS classes apply a glassmorphic style (backdrop blur, semi-transparent background, rounded corners, etc.). */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-2xl p-8 rounded-2xl max-w-md w-full"
      >
        {/* Page title with styling for large, bold text, centered with drop shadow */}
        <h1 className="text-4xl font-bold mb-6 text-center text-white drop-shadow">
          Sign Up
        </h1>

        {/* AnimatePresence component is used to animate components that are being added or removed from the tree */}
        <AnimatePresence>
          {/* If an error message exists, render an animated div to display it */}
          {error && (
            <motion.div
              // Animation for error message: fade in from above
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              // Tailwind classes for styling the error box
              className="mb-4 p-2 bg-red-100 text-red-700 rounded shadow"
            >
              {error} {/* Display the error message */}
            </motion.div>
          )}
          {/* If a success message exists, render an animated div to display it */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              // Tailwind classes for styling the success message box
              className="mb-4 p-2 bg-green-100 text-green-700 rounded shadow"
            >
              {message} {/* Display the success message */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* The signup form container */}
        {/* When the form is submitted, the handleSignup function is called */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Username input field with Framer Motion animation on focus */}
          <motion.input
            whileFocus={{ scale: 1.02 }} // Slightly scales up the input field when focused for a dynamic effect
            type="text" // Input type text for the username
            placeholder="Username" // Placeholder text for guidance
            value={username} // Bind this input's value to the username state
            onChange={(e) => setUsername(e.target.value)} // Update username state on input change
            // Tailwind classes for styling: full width, padding, background color, text color, border, rounded corners, focus effects, etc.
            className="w-full p-3 bg-white/80 text-gray-800 placeholder-gray-600 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required // Field is required for form submission
          />
          {/* Email input field with similar configuration and animation */}
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email" // Specifies the email input type for proper validation
            placeholder="Email" // Placeholder text
            value={email} // Bind value to email state
            onChange={(e) => setEmail(e.target.value)} // Update email state on change
            className="w-full p-3 bg-white/80 text-gray-800 placeholder-gray-600 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {/* Password input field with similar configuration */}
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password" // Password type to hide the text input
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-white/80 text-gray-800 placeholder-gray-600 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {/* Select dropdown to choose the user role */}
          <motion.select
            whileFocus={{ scale: 1.02 }}
            value={role} // Bind value to role state
            onChange={(e) => setRole(e.target.value)} // Update role state when selection changes
            className="w-full p-3 bg-white/80 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {/* Option for regular user */}
            <option value="user">User</option>
            {/* Option for admin user */}
            <option value="admin">Admin</option>
          </motion.select>

          {/* Submit button with tap and hover animations */}
          <motion.button
            whileTap={{ scale: 0.97 }} // Scales down slightly on click/tap
            whileHover={{ scale: 1.03 }} // Slightly scales up when hovered over
            type="submit" // Specifies that this button submits the form
            disabled={loading} // Disables the button during the signup process to prevent multiple submissions
            // Tailwind classes for styling: full width, padding, background color, text styling, hover effects, transitions, and shadow
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
          >
            {loading ? "Signing Up..." : "Sign Up"} {/* Button text changes based on loading state */}
          </motion.button>
        </form>

        {/* This paragraph provides a link for users who already have an account to navigate to the login page */}
        <motion.p
          initial={{ opacity: 0 }} // Starts off hidden
          animate={{ opacity: 1 }} // Animates to full visibility
          transition={{ delay: 0.6 }} // Animation delay for a smoother transition after the form
          className="mt-4 text-center text-white" // Styles: margin top, centered text, and white text color
        >
          Already have an account?{" "}
          {/* A simple HTML anchor (<a>) element that links to the login page */}
          <a
            href="/login" // Navigates to the login page when clicked
            className="text-blue-300 hover:underline font-medium" // Styles: blue text, underline on hover, and medium font weight
          >
            Login here
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
