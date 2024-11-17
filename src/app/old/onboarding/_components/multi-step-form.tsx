"use client";

import { AnimatePresence } from "framer-motion";

export function Onboarding(props: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-[calc(100vh-48px)] w-full max-w-screen-sm flex-col items-center">
      <AnimatePresence mode="wait">{props.children}</AnimatePresence>
    </div>
  );
}
