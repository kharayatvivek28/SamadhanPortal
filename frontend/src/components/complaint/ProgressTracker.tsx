import { CheckCircle2, Clock, Circle } from "lucide-react";
// Animation: Added framer-motion for sequential step entrance animation
import { motion } from "framer-motion";

const steps = ["Submitted", "Dept. Assigned", "Officer Assigned", "In Progress", "Resolved"];

const statusIndex: Record<string, number> = {
  submitted: 0,
  assigned_dept: 1,
  assigned_officer: 2,
  in_progress: 3,
  resolved: 4,
};

interface Props {
  status: string;
}

const ProgressTracker = ({ status }: Props) => {
  const current = statusIndex[status] ?? 0;

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {steps.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          // Animation: Each step animates in sequentially with staggered delay
          <motion.div
            key={step}
            className="flex items-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.1, ease: "easeOut" }}
          >
            <div className="flex flex-col items-center min-w-[64px]">
              {/* Animation: Icons scale in with a subtle spring */}
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.1 + 0.1 }}
              >
                {done && !active ? (
                  <CheckCircle2 className="h-5 w-5 text-status-resolved" />
                ) : active ? (
                  <Clock className="h-5 w-5 text-status-progress" />
                ) : (
                  <Circle className="h-5 w-5 text-status-pending" />
                )}
              </motion.div>
              <span className={`text-[10px] mt-1 text-center leading-tight ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              // Animation: Connector line grows in width
              <motion.div
                className={`h-0.5 w-6 ${i < current ? "bg-status-resolved" : "bg-border"}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 + 0.15 }}
                style={{ transformOrigin: "left" }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProgressTracker;
