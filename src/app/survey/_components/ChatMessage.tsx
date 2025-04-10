import { CoreMessage } from "ai";
import Markdown from "react-markdown";

interface ChatMessageProps {
  message: CoreMessage;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex gap-3 max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isUser ? "bg-blue-500" : "bg-green-500"
          }`}
        >
          {isUser ? "U" : "AI"}
        </div>
        <div
          className={`rounded-lg p-3 ${
            isUser
              ? "bg-blue-500 text-white rounded-tr-none"
              : "bg-gray-100 dark:bg-gray-800 rounded-tl-none"
          }`}
        >
          <Markdown>
            {typeof message.content === "string"
              ? message.content
              : "Content not available"}
          </Markdown>
        </div>
      </div>
    </div>
  );
};
