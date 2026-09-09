import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { toggle, theme } = useThemeContext();
  return (
    <button
      onClick={toggle}
      className={`ml-auto p-2 rounded-full transition-colors duration-300 ${
        theme === "light"
          ? "bg-white text-gray-800 hover:bg-gray-200"
          : "bg-gray-800 text-white hover:bg-gray-600"
      }`}
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </button>
  );
};

export default ThemeToggle;
