/**
 * AnimatedCard — Lightweight hover/tap wrapper for interactive elements.
 * Adds a subtle lift on hover and scale-down on tap for a modern feel.
 * Use on cards, buttons, and clickable containers.
 */
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface Props extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  /** Disable hover lift effect */
  noHover?: boolean;
  /** Disable tap scale effect */
  noTap?: boolean;
}

const AnimatedCard = ({
  children,
  className,
  noHover = false,
  noTap = false,
  ...rest
}: Props) => (
  <motion.div
    whileHover={noHover ? undefined : { y: -3, transition: { duration: 0.2 } }}
    whileTap={noTap ? undefined : { scale: 0.98 }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);

export default AnimatedCard;
