// Tell Next.js that this code should run on the client side.
"use client";

// Import necessary functions and hooks from React:
// - createContext: to create a new Context object for state sharing.
// - useContext: to access that context in child components.
// - useState: to manage state within a component.
import { createContext, useContext, useState } from 'react';

// Define a TypeScript interface for a User object.
// This interface dictates that a User must have at least a "username" property of type string.
// You can add other properties later as needed.
interface User {
  role: string;
  username: string;
  // Add other user properties if needed
}

// Define an interface for the UserContext's value.
// This interface includes two properties:
// - user: which can be either a User object or null if no user is logged in.
// - setUser: a function that takes a User or null to update the user state.
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Create a Context for the user using React's createContext method.
// The generic parameter is of type UserContextType or undefined.
// Initially, we provide "undefined" as the default value.
const UserContext = createContext<UserContextType | undefined>(undefined);

// Export a React component "UserProvider" that will wrap your app (or parts of it) to provide the User context to its children.
// It is defined as a React Functional Component (React.FC) that expects a "children" prop.
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Declare a state variable "user" and a "setUser" function using useState.
  // The initial state is determined by a function to safely check if we're on the client side.
  const [user, setUser] = useState<User | null>(() => {
    // Check if we're in the browser environment (to avoid issues during server-side rendering).
    if (typeof window !== 'undefined') {
      // Try to retrieve the 'user' data from localStorage.
      const storedUser = localStorage.getItem("user");
      // If data exists, parse the JSON string into a JavaScript object; otherwise, return null.
      return storedUser ? JSON.parse(storedUser) : null;
    }
    // If not in the browser (e.g., during SSR), return null.
    return null;
  });

  // Return the UserContext.Provider with the user and setUser values provided.
  // This wraps the children with the context, making the user state available anywhere in the component tree.
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}  {/* Render any children passed to the UserProvider component */}
    </UserContext.Provider>
  );
};

// Export a custom hook 'useUser' to easily access the User context.
// This hook internally uses useContext to read the context value created above.
export const useUser = () => {
  // Retrieve the current context value for UserContext.
  const context = useContext(UserContext);
  // If the hook is used outside of the UserProvider, context will be undefined.
  // In that case, throw an error to inform the developer to wrap the component in a UserProvider.
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  // Otherwise, return the user context (which includes both user and setUser).
  return context;
};
