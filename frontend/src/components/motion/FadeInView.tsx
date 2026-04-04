/**
 * FadeInView — Viewport-triggered fade-in animation wrapper.
 * Uses framer-motion's whileInView to animate children when scrolled into view.
 * Great for footer sections, homepage blocks, and any content below the fold.
 */
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Animation direction: "up" slides from below, "left"/"right" from sides */
  direction?: "up" | "down" | "left" | "right";
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Duration of the animation (seconds) */
  duration?: number;
}

const directionOffset = {
  up: { y: 30, x: 0 },
  down: { y: -30, x: 0 },
  left: { x: 30, y: 0 },
  right: { x: -30, y: 0 },
};

const FadeInView = ({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.5,
}: Props) => {
  const offset = directionOffset[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeInView;
