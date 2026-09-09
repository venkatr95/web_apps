import React, { useEffect } from "react";
import { toast } from "react-hot-toast";
import { IoIosLogIn } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import CustomizedInput from "../components/shared/CustomizedInput";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      toast.loading("Signing In", { id: "login" });
      await auth?.login(email, password);
      toast.success("Signed In Successfully", { id: "login" });
    } catch (error) {
      console.error(error);
      toast.error("Signing In Failed", { id: "login" });
    }
  };

  useEffect(() => {
    if (auth?.user) navigate("/chat");
  }, [auth, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-white dark:bg-gray-900 text-black dark:text-white px-4 py-10">
      {/* Login Form */}
      <div className="flex flex-1 items-center justify-center w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 dark:bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-md space-y-6 transition"
        >
          <h2 className="text-3xl font-bold text-center mb-4">Welcome</h2>

          <CustomizedInput type="email" name="email" label="Email" />
          <CustomizedInput type="password" name="password" label="Password" />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-400 text-black font-semibold rounded-md hover:bg-white dark:hover:bg-white dark:hover:text-black transition"
          >
            Login <IoIosLogIn size={20} />
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-cyan-500 hover:underline dark:text-cyan-400"
            >
              Sign up here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
