import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../ui/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="rounded-xl shadow-lg overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        <div className="border-4 border-light-gray-100 w-full md:w-1/2">
          <div className="p-8">
            <Link to="/" className="inline-block mb-8">
              {/* <div className="flex items-center text-primary-500">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 6C12.68 6 10 8.68 10 12C10 17 16 26 16 26C16 26 22 17 22 12C22 8.68 19.32 6 16 6ZM16 14C14.9 14 14 13.1 14 12C14 10.9 14.9 10 16 10C17.1 10 18 10.9 18 12C18 13.1 17.1 14 16 14Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="ml-2 text-xl font-bold">wanderlog</span>
                </div> */}
            </Link>

            <LoginForm />
          </div>
        </div>

        <div
          className="hidden md:block w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg')",
          }}
        >
          <div className="h-full w-full bg-gradient-to-r from-primary-500/70 to-secondary-500/70 p-8 flex items-center">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-4">
                Welcome back, explorer!
              </h2>
              <p className="text-lg mb-6">
                Log in to access your trips, discover new destinations, and
                continue your journey with Wanderlog.
              </p>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <p className="italic text-white/90 mb-3">
                  "The world is a book and those who do not travel read only one
                  page."
                </p>
                <p className="font-medium">— Saint Augustine</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
