import { motion } from "framer-motion";
import { ShieldAlert, Shield, ShieldCheck } from "lucide-react";

interface Props {
  level: number; // 0 = none, 1 = low, 2 = medium, 3 = high
  className?: string;
}

const levelConfig: Record<number, { label: string; color: string; icon: typeof ShieldCheck; shouldFlash: boolean }> = {
  0: { label: "Normal", color: "bg-muted text-muted-foreground", icon: ShieldCheck, shouldFlash: false },
  1: { label: "Level 1", color: "bg-status-progress/15 text-foreground border border-status-progress/30", icon: Shield, shouldFlash: false },
  2: { label: "Level 2", color: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30", icon: ShieldAlert, shouldFlash: true },
  3: { label: "Level 3", color: "bg-destructive/15 text-destructive border border-destructive/30", icon: ShieldAlert, shouldFlash: true },
};

const EscalationBadge = ({ level, className = "" }: Props) => {
  if (level <= 0) return null;

  const config = levelConfig[level] || levelConfig[1];
  const Icon = config.icon;

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color} ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <motion.div
        animate={config.shouldFlash ? { opacity: [1, 0.4, 1] } : {}}
        transition={config.shouldFlash ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
      >
        <Icon className="h-3.5 w-3.5" />
      </motion.div>
      <span>Escalation {config.label}</span>
    </motion.div>
  );
};

export default EscalationBadge;
