import { useEffect, useLayoutEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoMdSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import ChatItem from "../components/chat/ChatItem";
import { useAuth } from "../context/AuthContext";
import {
  deleteUserChats,
  getUserChats,
  sendChatRequest,
} from "../helpers/api-communicator";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const auth = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const handleSubmit = async () => {
    const content = inputRef.current?.value?.trim();
    if (!content) return;

    inputRef.current!.value = "";
    const newMessage: Message = { role: "user", content };
    setChatMessages((prev) => [...prev, newMessage]);

    try {
      const chatData = await sendChatRequest(content);
      setChatMessages([...chatData.chats]);
    } catch (error) {
      toast.error("Chat request failed");
    }
  };

  const handleDeleteChats = async () => {
    try {
      toast.loading("Deleting Chats", { id: "deletechats" });
      await deleteUserChats();
      setChatMessages([]);
      toast.success("Chats deleted", { id: "deletechats" });
    } catch (error) {
      toast.error("Failed to delete chats", { id: "deletechats" });
    }
  };

  useLayoutEffect(() => {
    if (auth?.isLoggedIn && auth.user) {
      toast.loading("Loading Chats", { id: "loadchats" });
      getUserChats()
        .then((data) => {
          setChatMessages(data.chats);
          toast.success("Chats loaded", { id: "loadchats" });
        })
        .catch(() => {
          toast.error("Failed to load chats", { id: "loadchats" });
        });
    }
  }, [auth]);

  useEffect(() => {
    if (!auth?.user) {
      navigate("/login");
    }
  }, [auth, navigate]);

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen gap-4 p-4 bg-white dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-full md:w-1/4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-white text-black font-bold rounded-full flex items-center justify-center text-xl">
            {auth?.user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <p className="text-center font-medium text-gray-700 dark:text-gray-200">
            You are talking to a chatbot
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4 mt-4">
            You can ask questions related to knowledge, business, advice,
            education, etc. Avoid sharing personal info.
          </p>
          <button
            onClick={handleDeleteChats}
            className="mt-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Clear Conversation
          </button>
        </div>
      </aside>

      {/* Chat area */}
      <section className="flex flex-col w-full md:w-3/4">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">
          Model - GPT 3.5 Turbo
        </h1>

        <div className="flex flex-col gap-2 h-[60vh] overflow-y-auto p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {chatMessages.map((chat, index) => (
            <ChatItem key={index} content={chat.content} role={chat.role} />
          ))}
        </div>

        <div className="flex items-center mt-4 bg-gray-200 dark:bg-gray-700 rounded-xl px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevents the default form submission (if inside a form)
                handleSubmit();
              }
            }}
            className="flex-1 bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-lg"
          />
          <button
            onClick={handleSubmit}
            className="ml-2 text-xl text-gray-700 dark:text-white hover:text-blue-500"
          >
            <IoMdSend />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Chat;
