import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  deadline?: string | Date;
  className?: string;
}

const SLACountdown = ({ deadline, className = "" }: Props) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (!deadline) return;

    const calcTime = () => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsOverdue(true);
        const absDiff = Math.abs(diff);
        const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft(`Overdue by ${days}d ${hours}h`);
      } else {
        setIsOverdue(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }
    };

    calcTime();
    const interval = setInterval(calcTime, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) {
    return null;
  }

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
        isOverdue
          ? "bg-destructive/10 text-destructive border border-destructive/20"
          : "bg-status-progress/10 text-foreground border border-status-progress/20"
      } ${className}`}
      animate={isOverdue ? { scale: [1, 1.02, 1] } : {}}
      transition={isOverdue ? { duration: 1.5, repeat: Infinity } : {}}
    >
      {isOverdue ? (
        <AlertTriangle className="h-4 w-4 animate-pulse" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      <span>SLA: {timeLeft}</span>
    </motion.div>
  );
};

export default SLACountdown;
