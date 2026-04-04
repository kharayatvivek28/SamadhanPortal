import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

const containerVariants = (staggerDelay: number) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
});

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const StaggerContainer = ({ children, className, staggerDelay = 0.1 }: Props) => (
  <motion.div
    variants={containerVariants(staggerDelay)}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
);

export default StaggerContainer;
