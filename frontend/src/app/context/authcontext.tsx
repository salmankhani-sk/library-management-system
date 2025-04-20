// contexts/AuthContext.tsx
// Import necessary React hooks and types for creating and managing context, state, and effects.
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define the User type, which represents the shape of the authenticated user's data.
// Currently, it only has a 'username' field, but more fields can be added as needed.
type User = {
  username: string; // The username of the authenticated user.
  // add more fields as needed (e.g., email, id, role).
};

// Define the AuthContextType, which specifies the shape of the context value.
// This includes the user object, a function to set the user, and a logout function.
type AuthContextType = {
  user: User | null; // The current user, or null if no user is logged in.
  setUser: (user: User | null) => void; // Function to update the user state.
  logout: () => void; // Function to log the user out.
};

// Create the AuthContext using createContext. It’s initialized as undefined.
// This context will store and provide authentication-related data and functions.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider component, which wraps the app and provides the auth context.
// It takes 'children' as a prop, which represents the nested components that will use the context.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use useState to manage the user state. The initial value is null (no user logged in).
  const [user, setUser] = useState<User | null>(null);

  // Use useEffect to run code when the component mounts (on page load).
  // This checks localStorage for a stored user and sets it in state if found.
  useEffect(() => {
    // Get the 'user' item from localStorage, which stores the user data as a string.
    const storedUser = localStorage.getItem("user");
    // If a stored user exists, parse it from JSON string to an object and set it in state.
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Convert string to User object and update state.
    }
  }, []); // Empty dependency array ensures this runs only once when the component mounts.

  // Define the logout function to handle user logout.
  const logout = () => {
    // Remove the 'user' item from localStorage to clear stored user data.
    localStorage.removeItem("user");
    // Remove the 'access_token' item from localStorage to clear any auth token.
    localStorage.removeItem("access_token");
    // Set the user state to null, effectively logging the user out in the app.
    setUser(null);
  };

  // Return the AuthContext.Provider component, which makes the context available to children.
  // The 'value' prop contains the user, setUser function, and logout function.
  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children} {/* Render any children passed to the AuthProvider component */}
    </AuthContext.Provider>
  );
};

// Define a custom hook called useAuth to easily access the AuthContext in other components.
export const useAuth = () => {
  // Use useContext to get the current value of AuthContext.
  const context = useContext(AuthContext);
  // Check if context is undefined (i.e., hook is used outside of AuthProvider).
  // If so, throw an error to enforce proper usage within an AuthProvider.
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  // Return the context, which includes user, setUser, and logout.
  return context;
};