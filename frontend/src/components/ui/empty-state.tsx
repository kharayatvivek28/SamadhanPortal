import { motion } from "framer-motion";
import { ReactNode } from "react";
import { FileX, Search, Inbox } from "lucide-react";

type EmptyVariant = "no-data" | "no-results" | "inbox-empty";

interface Props {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const iconMap: Record<EmptyVariant, typeof FileX> = {
  "no-data": Inbox,
  "no-results": Search,
  "inbox-empty": FileX,
};

const defaultMessages: Record<EmptyVariant, { title: string; desc: string }> = {
  "no-data": {
    title: "No data yet",
    desc: "Nothing to display at the moment. Data will appear here once available.",
  },
  "no-results": {
    title: "No results found",
    desc: "Try adjusting your search or filter criteria to find what you're looking for.",
  },
  "inbox-empty": {
    title: "All clear!",
    desc: "There are no items in your queue right now.",
  },
};

const EmptyState = ({ variant = "no-data", title, description, action, className = "" }: Props) => {
  const Icon = iconMap[variant];
  const defaults = defaultMessages[variant];

  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="bg-muted rounded-full p-6 mb-6"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon className="h-10 w-10 text-muted-foreground" />
      </motion.div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title || defaults.title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description || defaults.desc}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
