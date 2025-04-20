/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client" indicates that this component should be rendered on the client side.
// This is necessary for components that use browser-only features or React hooks.
"use client";

// Import the useState and useEffect hooks from React for managing state and side effects.
import { useState, useEffect } from "react";
// Import the useRouter hook from Next.js to enable programmatic navigation.
import { useRouter } from "next/navigation";
// Import the useUser custom hook from our UserProvider to access the current user's state.
import { useUser } from "../UserProvider"; // Correct path to your UserProvider
// Import motion and AnimatePresence from Framer Motion to add animations to our components.
import { motion, AnimatePresence } from "framer-motion";

// Define and export the LoginPage functional component.
export default function LoginPage() {
  // Destructure setUser from our custom useUser hook.
  // setUser is used to update the global user state stored in context.
  const { setUser } = useUser();
  // Get the router object from Next.js to allow navigation (e.g., redirection after login).
  const router = useRouter();
  // Create a state variable called username to hold the value of the username input field.
  // Initially, it is set to an empty string.
  const [username, setUsername] = useState("");
  // Create a state variable called password for the password input; also initially an empty string.
  const [password, setPassword] = useState("");
  // Create a state variable for error messages.
  // It holds a string if there's an error or null if there's none.
  const [error, setError] = useState<string | null>(null);
  // Create a state variable to indicate if a login request is in progress.
  // It starts as false (no request in progress).
  const [loading, setLoading] = useState(false);

  // useEffect hook runs after the component renders.
  // This hook checks if the user is already logged in by verifying
  // the existence of both the "user" and "access_token" items in localStorage.
  useEffect(() => {
    // Retrieve the stored user from localStorage.
    const user = localStorage.getItem("user");
    // Retrieve the stored access token from localStorage.
    const token = localStorage.getItem("access_token");
    // If both the user and token exist, then the user is considered logged in.
    if (user && token) {
      // Redirect the user to the homepage using the router.
      router.push("/");
    }
    // The dependency array includes router so that if router changes, this effect re-runs.
  }, [router]);

  // Define an asynchronous function handleLogin, which will handle the login form submission.
  const handleLogin = async (e: React.FormEvent) => {
    // Prevent the default form submission behavior (which would reload the page).
    e.preventDefault();
    // Clear any previous error message.
    setError(null);
    // Set loading to true, indicating that a login request is in progress.
    setLoading(true);
    try {
      // Make a POST request to the login endpoint of your backend API.
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        // Specify the method as POST since we are sending data.
        method: "POST",
        // Set the content type of the request to JSON.
        headers: { "Content-Type": "application/json" },
        // Serialize the username and password into a JSON string to be sent as the request body.
        body: JSON.stringify({ username, password }),
      });

      // If the response is not OK (status not in the 200–299 range), then process the error.
      if (!res.ok) {
        // Parse the error data from the response.
        const errData = await res.json();
        // Throw a new error with the error message from the response, or a default message.
        throw new Error(errData.detail || "Login failed");
      }

      // If the response is OK, parse the JSON data containing user information and tokens.
      const data = await res.json();
      // Save the user information in localStorage as a JSON string.
      localStorage.setItem("user", JSON.stringify(data.user));
      // Store the user ID separately (if needed) in localStorage.
      localStorage.setItem("userId", data.user.id);
      // Save the access token in localStorage, which is used for authenticated requests.
      localStorage.setItem("access_token", data.access_token);
      // Update the global user state by calling setUser with the user data from the response.
      setUser(data.user);
      // Redirect the user to the homepage after a successful login.
      router.push("/");
    } catch (err: any) {
      // If an error occurs during the fetch, update the error state with the error message.
      setError(err.message);
    } finally {
      // Whether the login was successful or an error occurred, set loading to false.
      setLoading(false);
    }
  };

  // Return the JSX that defines the UI for the login page.
  return (
    // Outer container div that fills the minimum height of the screen.
    // Tailwind classes applied:
    // - bg-cover: scales background image to cover the div.
    // - bg-center: centers the background image.
    // - flex items-center justify-center: centers its content both vertically and horizontally.
    // - px-4: horizontal padding.
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      // Inline style to set the background image. The image file 'auth-login.png'
      // should be located in the public folder so it can be served from the root URL.
      style={{ backgroundImage: "url('/auth-login.png')" }}
    >
      {/* 
          motion.div is used from Framer Motion to wrap the main login card.
          It provides animation for when the component loads:
          - initial: starting with opacity 0 and positioned 40px above its final place.
          - animate: transitioning to full opacity and correct vertical position.
          - transition: defines the duration and easing of the animation.
          Tailwind classes add a glass-like effect with blur, semi-transparent background,
          borders, shadows, padding, and rounded corners.
      */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-2xl p-8 rounded-2xl max-w-md w-full"
      >
        {/* 
            Display a title for the login page with large, bold text.
            Tailwind classes style the text to be white, centered, and with a drop shadow.
        */}
        <h1 className="text-4xl font-bold mb-6 text-center text-white drop-shadow">
          Login
        </h1>

        {/* 
            AnimatePresence is used to animate the addition and removal of components.
            Here, it wraps potential error messages so that they animate smoothly when appearing or disappearing.
        */}
        <AnimatePresence>
          {error && (
            // motion.div wraps the error message; it fades and slides in/out.
            <motion.div
              initial={{ opacity: 0, y: -10 }} // Start hidden and slightly above.
              animate={{ opacity: 1, y: 0 }}    // Animate to fully visible and in place.
              exit={{ opacity: 0 }}            // When removed, fade out.
              className="mb-4 p-2 bg-red-100 text-red-700 rounded shadow" // Styling for the error box.
            >
              {error} {/* Show the error message stored in the error state */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
            The form element which handles user login.
            The onSubmit handler for the form is set to our handleLogin function.
            Tailwind class "space-y-4" adds vertical spacing between form elements.
        */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Input field for username */}
          <motion.input
            whileFocus={{ scale: 1.02 }} // Animate a slight scale-up when the input is focused.
            type="text" // Specifies that this input is for text (username).
            placeholder="Username" // Placeholder text to indicate what to enter.
            value={username} // Binds the input's value to the username state.
            onChange={(e) => setUsername(e.target.value)} // Updates the state when the user types.
            className="w-full p-3 bg-white/80 text-gray-800 placeholder-gray-600 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            // Tailwind classes:
            // w-full: full width; p-3: padding; bg-white/80: semi-transparent white background;
            // text-gray-800: text color; placeholder-gray-600: placeholder text color;
            // rounded-lg: rounded corners; border & border-gray-300: border styling;
            // focus:outline-none and focus:ring-2 focus:ring-blue-400: add focus styles.
            required // Ensures the field must be filled out before submitting.
          />
          {/* Input field for password */}
          <motion.input
            whileFocus={{ scale: 1.02 }} // Animate on focus
            type="password" // Type password ensures the text is hidden as it's typed.
            placeholder="Password"
            value={password} // Binds to the password state variable.
            onChange={(e) => setPassword(e.target.value)} // Updates the password state on change.
            className="w-full p-3 bg-white/80 text-gray-800 placeholder-gray-600 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required // This field is required.
          />

          {/* 
              The button that submits the form.
              It uses Framer Motion for tap and hover animations.
              The "disabled" attribute disables the button when loading is true.
          */}
          <motion.button
            whileTap={{ scale: 0.97 }}   // Slightly scales down when pressed.
            whileHover={{ scale: 1.03 }}   // Slightly scales up when hovered.
            type="submit"                // Button type is submit (triggers form submission).
            disabled={loading}           // Disables the button if loading state is true.
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
            // Tailwind classes applied:
            // w-full: full width; py-3: vertical padding; bg-blue-600: blue background;
            // text-white: white text; font-semibold: semibold font;
            // rounded-lg: rounded corners; hover:bg-blue-700: changes color on hover;
            // transition: smooth transition; duration-300: 300ms duration; shadow-md: medium shadow.
          >
            {loading ? "Logging In..." : "Login"} {/* Conditional rendering: shows a loading text if loading is true */}
          </motion.button>
        </form>

        {/* 
            Below the form, provide a link for users who do not have an account yet,
            prompting them to sign up.
            This is wrapped in a motion.p for a fade-in effect.
        */}
        <motion.p
          initial={{ opacity: 0 }} // Initially hidden
          animate={{ opacity: 1 }} // Animate to full visibility
          transition={{ delay: 0.6 }} // Start the animation after a 0.6-second delay
          className="mt-4 text-center text-white" // Tailwind: margin-top, center text, white text color.
        >
          {/* Use HTML entity for an apostrophe in "Don't" */}
          Don&apos;t have an account?{" "}
          {/* Anchor tag linking to the signup page.
              Tailwind classes style the link with blue color, underline on hover, and medium font weight. */}
          <a
            href="/signup" // Navigate to the signup page when clicked.
            className="text-blue-300 hover:underline font-medium"
          >
            Sign up
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
