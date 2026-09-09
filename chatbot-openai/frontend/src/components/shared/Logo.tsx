import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <div className="flex items-center gap-4 mr-auto">
      <Link to="/">
        <img
          src="/openai.png"
          alt="openai"
          width={30}
          height={30}
          className="dark:invert"
        />
      </Link>

      <span
        className="hidden md:block font-extrabold text-lg md:text-xl dark:text-white"
        style={{ textShadow: "2px 2px 20px #000" }}
      >
        <span className="text-base md:text-lg">Custom</span> chatbot
      </span>
    </div>
  );
};

export default Logo;
