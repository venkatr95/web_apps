import React, { createContext, StrictMode, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Define the user type
interface UserType {
  email: string;
  phone: string;
  role: "user" | "admin";
  category: "Basic" | "Silver" | "Gold";
  // Add more fields if needed
}

// Define the shape of context
interface ContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

// Create Context with default values
export const Context = createContext<ContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
});


const AppWrapper: React.FC = () => {
  // const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // const [user, setUser] = useState<UserType | null>(null);

  return (
    // <Context.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    // </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
  <React.StrictMode>
    <ThemeProvider>
      <AppWrapper />
    </ThemeProvider>
  </React.StrictMode>
  </StrictMode>
);
