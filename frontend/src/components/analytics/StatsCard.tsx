import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { staggerItemVariants } from "@/components/motion/StaggerContainer";
// Animation: Added react-countup + intersection observer for animated number counting
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

const StatsCard = ({ title, value, icon: Icon, description }: Props) => {
  // Animation: Trigger counter only when card scrolls into view
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const numericValue = typeof value === "number" ? value : parseInt(value, 10);
  const isNumeric = !isNaN(numericValue);

  return (
    <motion.div
      ref={ref}
      variants={staggerItemVariants}
      className="bg-card rounded-lg border shadow-sm p-5 hover:shadow-md transition-shadow"
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          {/* Animation: Animated number counting from 0 to value */}
          <p className="text-2xl font-bold text-card-foreground mt-1">
            {isNumeric && inView ? (
              <CountUp end={numericValue} duration={1.5} separator="," />
            ) : (
              value
            )}
          </p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        {/* Animation: Icon scales in with a spring */}
        <motion.div
          className="bg-primary/10 p-2.5 rounded-lg"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : { scale: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
        >
          <Icon className="h-5 w-5 text-primary" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
