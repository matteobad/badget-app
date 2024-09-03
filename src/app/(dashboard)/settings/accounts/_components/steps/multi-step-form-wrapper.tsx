"use client";

import { AnimatePresence, motion } from "framer-motion";

export function MultiStepFormWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
