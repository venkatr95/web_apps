import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : ''}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className={`theme-toggle__icon ${isDark ? 'theme-toggle__icon--dark' : ''}`} />
      ) : (
        <Moon className={`theme-toggle__icon ${isDark ? 'theme-toggle__icon--dark' : ''}`} />
      )}
    </button>
  );
}