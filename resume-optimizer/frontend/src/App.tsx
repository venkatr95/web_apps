import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Header } from "./components/layout/Header";
import { ResumeEditor } from "./components/resume/ResumeEditor";
import { Loader2, Moon, Sun } from "./components/ui/Icons";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { ResumeAnalyzer } from "./pages/ResumeAnalyzer";

function App() {
  const { user, loading } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    document.documentElement.className = resolvedTheme;
  }, [resolvedTheme]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
        {user && <Header />}

        <Routes>
          <Route
            path="/auth"
            element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/editor/:id?"
            element={user ? <ResumeEditor /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/analyzer"
            element={
              user ? <ResumeAnalyzer /> : <Navigate to="/auth" replace />
            }
          />
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/auth"} replace />}
          />
        </Routes>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="fixed bottom-5 right-5 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-800" />
          )}
        </button>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: resolvedTheme === "dark" ? "#374151" : "#ffffff",
              color: resolvedTheme === "dark" ? "#ffffff" : "#000000",
              border: `1px solid ${resolvedTheme === "dark" ? "#4B5563" : "#E5E7EB"}`,
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
