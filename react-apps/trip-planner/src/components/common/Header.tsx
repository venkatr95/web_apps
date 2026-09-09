import { Moon, Palmtree as PalmTree, Sun, User } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => {
  const { theme } = useTheme();

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`px-4 py-2 rounded-lg transition-colors ${
        active
          ? theme === "dark"
            ? "bg-teal-600 text-white"
            : "bg-teal-500 text-white"
          : theme === "dark"
          ? "text-gray-300 hover:bg-gray-800"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  );
};

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header
      className={`sticky top-0 z-10 backdrop-blur-md ${
        theme === "dark"
          ? "bg-gray-900/90 border-b border-gray-800"
          : "bg-white/90 border-b border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <PalmTree className="w-8 h-8 text-teal-500" />
          <span className="text-xl font-bold">TravelBuddy</span>
        </Link>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              theme === "dark"
                ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/auth">
            <User
              size={20}
              className={`cursor-pointer ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
              aria-label="Login/Register"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/itinerary"
              active={location.pathname === "/itinerary"}
            >
              Itinerary
            </NavLink>
            <NavLink to="/chat" active={location.pathname === "/chat"}>
              Chat
            </NavLink>
            <NavLink to="/expenses" active={location.pathname === "/expenses"}>
              Expenses
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
