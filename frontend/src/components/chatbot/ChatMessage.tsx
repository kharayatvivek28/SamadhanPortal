/**
 * ChatMessage — Individual message bubble for the chatbot
 * Supports user messages, bot messages, and typing indicator
 */
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "bot";
  text: string;
  isTyping?: boolean;
}

const ChatMessage = ({ role, text, isTyping }: ChatMessageProps) => {
  const isUser = role === "user";

  // Typing indicator dots animation
  if (isTyping) {
    return (
      <motion.div
        className="flex items-start gap-2 mb-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-primary/10 rounded-full p-1.5 shrink-0 mt-0.5">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
          <div className="flex gap-1 items-center h-5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`flex items-start gap-2 mb-3 ${isUser ? "flex-row-reverse" : ""}`}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Avatar */}
      <div
        className={`rounded-full p-1.5 shrink-0 mt-0.5 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10"
        }`}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-primary" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
            : "bg-muted text-foreground rounded-2xl rounded-tl-sm"
        }`}
      >
        {/* Render markdown-like bold text */}
        {text.split(/(\*\*[^*]+\*\*)/).map((part, idx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={idx}>{part.slice(2, -2)}</strong>;
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
