import { Eye, EyeOff, Facebook } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Mock validation
      if (email && password) {
        console.log("Login successful", { email });
        // Redirect would happen here
      } else {
        setError("Please enter both email and password");
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-gray-600">Log in to continue your journey</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Facebook size={20} />
          <span>Log in with Facebook</span>
        </button>

        <button className="w-full flex items-center justify-center gap-3 py-3 px-4 text-gray-600 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-dark-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Log in with Google</span>
        </button>

        <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.6 13.8C17.5 13.9 17.2 14.1 17 14.3C16.2 14.8 15.4 15.1 14.8 15.1C14.1 15.1 13.4 14.8 12.7 14.3C12.5 14.1 12.2 13.9 12 13.8C10.9 13.1 10.3 13 9.9 13H9.8C9.4 13 8.8 13.1 7.7 13.8C7.5 13.9 7.2 14.1 7 14.3C6.3 14.8 5.6 15.1 4.9 15.1C4.3 15.1 3.5 14.9 2.7 14.3C2.4 14.1 2.2 14 2.1 13.8C2 13.7 2 13.6 2 13.6V10.8C2 10.7 2 10.6 2.1 10.5C2.2 10.4 2.4 10.2 2.6 10C3.3 9.6 4.1 9.3 4.8 9.3C5.4 9.3 6.1 9.6 6.8 10C7 10.2 7.3 10.4 7.5 10.5C8.6 11.3 9.2 11.3 9.6 11.3H9.7C10.1 11.3 10.7 11.3 11.8 10.5C12 10.4 12.3 10.2 12.5 10C13.2 9.5 13.9 9.3 14.5 9.3C15.1 9.3 15.9 9.5 16.7 10C17 10.2 17.2 10.3 17.3 10.5C17.4 10.6 17.4 10.7 17.4 10.8V13.5C17.6 13.6 17.6 13.7 17.6 13.8ZM16.7 7.5C15.8 6.9 14.8 6.6 13.8 6.6C13.1 6.6 12.4 6.8 11.7 7.1C11.4 7.2 11.1 7.4 10.9 7.5C10.3 7.9 9.9 8 9.7 8C9.5 8 9.2 7.9 8.6 7.5C8.4 7.4 8.1 7.2 7.7 7.1C7 6.8 6.3 6.6 5.7 6.6C4.7 6.6 3.7 6.9 2.8 7.5C2.3 7.8 2 8.1 1.8 8.4C1.7 8.6 1.6 8.9 1.6 9.2V14.6C1.6 15 1.7 15.3 1.8 15.5C2 15.7 2.3 16.1 2.8 16.3C3.7 16.9 4.7 17.2 5.7 17.2C6.4 17.2 7.1 17 7.8 16.7C8.1 16.6 8.4 16.4 8.6 16.3C9.2 15.9 9.6 15.8 9.8 15.8C10 15.8 10.3 15.9 10.9 16.3C11.1 16.4 11.4 16.6 11.8 16.7C12.5 17 13.2 17.2 13.8 17.2C14.8 17.2 15.8 16.9 16.7 16.3C17.2 16 17.5 15.7 17.7 15.4C17.8 15.2 17.9 14.9 17.9 14.6V9.2C17.9 8.9 17.8 8.6 17.7 8.4C17.5 8.1 17.2 7.8 16.7 7.5Z" />
            <path d="M12.9 5.6V4.2H14.1V2.6H15.3V4.2H16.5V5.4H15.3V7H14.1V5.6H12.9Z" />
            <path d="M10.4 6.4V4.2H11.6V2.1H12.8V4.2H14V5.4H12.8V7.4H11.6V5.8L10.4 6.4Z" />
          </svg>
          <span>Log in with Apple</span>
        </button>
      </div>

      <div className="flex items-center my-6">
        <div className="flex-grow h-px bg-gray-300 dark:bg-dark-600"></div>
        <span className="px-4 text-sm text-gray-500 dark:text-gray-400">
          or
        </span>
        <div className="flex-grow h-px bg-gray-300 dark:bg-dark-600"></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm underline text-primary-500 hover:text-primary-600 text-gray-600"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border bg-lime-600 border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors">
                Login
              </button>
            )}
          </button>
        </div>
      </form>

      <p className="mt-6 underline text-center text-gray-600">
        Don't have an account yet?
      </p>
      <div className="mt-3 flex justify-center">
        <Link
          to="/signup"
          className="flex items-center gap-3 py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
