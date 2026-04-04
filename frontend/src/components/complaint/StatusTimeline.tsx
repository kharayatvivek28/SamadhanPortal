import { CheckCircle2, Clock, Circle } from "lucide-react";
import { TimelineEntry } from "@/data/mockData";
import { motion } from "framer-motion";

interface Props {
  timeline: TimelineEntry[];
}

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const StatusTimeline = ({ timeline }: Props) => {
  return (
    <div className="space-y-0">
      {timeline.map((entry, i) => {
        const isLast = i === timeline.length - 1;
        const inProgress = !entry.completed && i > 0 && timeline[i - 1]?.completed;

        return (
          <motion.div
            key={i}
            className="flex gap-4"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4, ease: "easeOut" }}
          >
            {/* Line + icon */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15 + 0.1, type: "spring", stiffness: 400, damping: 15 }}
              >
                {entry.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-status-resolved shrink-0" />
                ) : inProgress ? (
                  <Clock className="h-6 w-6 text-status-progress shrink-0 animate-pulse" />
                ) : (
                  <Circle className="h-6 w-6 text-status-pending shrink-0" />
                )}
              </motion.div>
              {!isLast && (
                <motion.div
                  className={`w-0.5 flex-1 min-h-[2rem] origin-top ${entry.completed ? "bg-status-resolved" : "bg-border"}`}
                  variants={lineVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.15 + 0.2 }}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-6">
              <p className={`font-medium text-sm ${entry.completed ? "text-foreground" : "text-muted-foreground"}`}>
                {entry.step}
              </p>
              {entry.timestamp && (
                <p className="text-xs text-muted-foreground mt-0.5">{entry.timestamp}</p>
              )}
              {entry.updatedBy && (
                <p className="text-xs text-muted-foreground">By: {entry.updatedBy}</p>
              )}
              {entry.remarks && (
                <p className="text-sm text-muted-foreground mt-1 bg-muted px-3 py-1.5 rounded">{entry.remarks}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
