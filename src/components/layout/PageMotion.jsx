import { motion, useReducedMotion } from "motion/react";

/** Opacity-only page enter — no layout-shifting transforms */
export default function PageMotion({ children, className }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
