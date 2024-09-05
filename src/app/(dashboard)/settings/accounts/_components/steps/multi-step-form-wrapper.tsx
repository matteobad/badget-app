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
        transition={{ delay: 0.3 }}
        className="flex flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
