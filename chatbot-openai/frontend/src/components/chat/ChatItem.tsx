import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuth } from "../../context/AuthContext";

function extractCodeFromString(message: string) {
  return message.includes("```") ? message.split("```") : null;
}

function isCodeBlock(str: string) {
  return /[={}[\]#;]|\/\/|const|let|function/.test(str);
}

const ChatItem = ({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) => {
  const auth = useAuth();
  const messageBlocks = extractCodeFromString(content);

  const initials = auth?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isAssistant = role === "assistant";

  return (
    <div
      className={`flex gap-4 p-4 rounded-lg my-2 ${
        isAssistant
          ? "bg-cyan-50 dark:bg-cyan-900/30"
          : "bg-cyan-600 text-white"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold overflow-hidden">
        {isAssistant ? (
          <img
            src="/openai.png"
            alt="openai"
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="flex flex-col space-y-2">
        {!messageBlocks && (
          <p className="text-base whitespace-pre-line dark:text-white">
            {content}
          </p>
        )}

        {messageBlocks &&
          messageBlocks.map((block, index) =>
            isCodeBlock(block) ? (
              <SyntaxHighlighter
                key={index}
                language="javascript"
                style={coldarkDark}
                customStyle={{
                  borderRadius: "0.5rem",
                  fontSize: "0.9rem",
                  padding: "1rem",
                }}
              >
                {block.trim()}
              </SyntaxHighlighter>
            ) : (
              <p key={index} className="text-base whitespace-pre-line">
                {block.trim()}
              </p>
            )
          )}
      </div>
    </div>
  );
};

export default ChatItem;
