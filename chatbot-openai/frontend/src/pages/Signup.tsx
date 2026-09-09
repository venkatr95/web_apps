import React, { useEffect } from "react";
import { toast } from "react-hot-toast";
import { IoIosLogIn } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import CustomizedInput from "../components/shared/CustomizedInput";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      toast.loading("Signing Up", { id: "signup" });
      await auth?.signup(name, email, password);
      toast.success("Signed Up Successfully", { id: "signup" });
    } catch (error) {
      console.error(error);
      toast.error("Signing Up Failed", { id: "signup" });
    }
  };

  useEffect(() => {
    if (auth?.user) {
      navigate("/chat");
    }
  }, [auth, navigate]);

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Signup Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-200 dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md space-y-6"
        >
          <h2 className="text-3xl font-bold text-center">Signup</h2>

          <CustomizedInput type="text" name="name" label="Name" />
          <CustomizedInput type="email" name="email" label="Email" />
          <CustomizedInput type="password" name="password" label="Password" />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-300 hover:bg-white hover:text-black text-black font-semibold rounded-md transition dark:bg-cyan-400 dark:hover:bg-white dark:hover:text-black"
          >
            Signup <IoIosLogIn />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
