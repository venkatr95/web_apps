import { useTheme } from "../../providers/ThemeProvider";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-3 right-28 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
};

export default ThemeToggle;
