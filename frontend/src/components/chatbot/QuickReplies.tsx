/**
 * QuickReplies — Horizontal scrollable row of quick action buttons
 * Used in the chatbot to present options to the user
 */
import { motion } from "framer-motion";

interface QuickReply {
  label: string;
  action: string;
}

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
}

const QuickReplies = ({ replies, onSelect }: QuickRepliesProps) => {
  if (!replies || replies.length === 0) return null;

  return (
    <motion.div
      className="flex flex-wrap gap-1.5 mb-3 px-1"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {replies.map((reply, index) => (
        <motion.button
          key={`${reply.action}-${index}`}
          onClick={() => onSelect(reply)}
          className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary 
                     bg-primary/5 hover:bg-primary/10 hover:border-primary/50 
                     transition-colors whitespace-nowrap font-medium"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {reply.label}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default QuickReplies;
