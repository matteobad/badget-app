"use client";

import type { BudgetRecurrenceType } from "~/server/db/schema/enum";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Check, Clock, RotateCcw, Settings } from "lucide-react";

interface BudgetInputProps {
  value: number;
  recurrence: BudgetRecurrenceType | null;
  isRecurring: boolean;
  onValueChange?: (value: number) => void;
  onOverride?: (value: number) => void;
  onPermanentChange?: (value: number) => void;
  className?: string;
}

export default function BudgetInput({
  value,
  recurrence,
  isRecurring,
  onValueChange,
  onOverride,
  onPermanentChange,
  className,
}: BudgetInputProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    setInputValue(value.toString());
    // Select all text after the transition completes
    setTimeout(() => {
      inputRef.current?.select();
    }, 200);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setInputValue(value.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
  };

  const handleDoubleClick = () => {
    setShowModal(true);
  };

  const handleConfirm = () => {
    const newValue = Number.parseFloat(inputValue) || 0;
    onValueChange?.(newValue);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleOverride = () => {
    const newValue = Number.parseFloat(inputValue) || 0;
    onOverride?.(newValue);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handlePermanentChange = () => {
    const newValue = Number.parseFloat(inputValue) || 0;
    onPermanentChange?.(newValue);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  return (
    <>
      <motion.div
        className={cn(
          "relative flex items-center overflow-hidden rounded-md transition-all duration-300 ease-out",
          "border border-transparent bg-transparent",
          isHovered && !isFocused && "border-border bg-background/50 shadow-xs",
          isFocused && "border-ring bg-background shadow-sm",
          className,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          paddingLeft: isFocused ? 12 : 0,
          paddingRight: isFocused ? 0 : 12,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Left Icons - Fixed position, fade out on focus */}
        <div className="pointer-events-none absolute left-3 flex items-center gap-2">
          <motion.div
            className="flex h-6 w-6 items-center justify-center"
            animate={{
              opacity: isFocused ? 0 : 1,
              scale: isFocused ? 0.9 : 1,
            }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <Badge
              variant="tag-rounded"
              className="size-full text-xs font-medium text-muted-foreground"
            >
              {recurrence?.charAt(0) ?? "M"}
            </Badge>
          </motion.div>

          <motion.div
            className="flex h-6 w-6 items-center justify-center"
            animate={{
              opacity: isFocused ? 0 : 1,
              scale: isFocused ? 0.9 : 1,
            }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
          >
            <Badge
              variant="tag-rounded"
              className="size-full p-0 text-xs font-medium text-muted-foreground"
            >
              {isRecurring ? (
                <RotateCcw className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Calendar className="h-3 w-3 text-muted-foreground" />
              )}
            </Badge>
          </motion.div>
        </div>

        {/* Input Field with smooth text transition */}
        <div className="relative flex-1">
          <motion.div
            animate={{
              paddingLeft: isFocused ? 0 : 80, // Space for icons when not focused
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              animate={{
                x: isFocused ? 0 : 0, // Keep position stable
              }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <Input
                ref={inputRef}
                value={isFocused ? inputValue : `${value.toLocaleString()} €`}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onDoubleClick={handleDoubleClick}
                className={cn(
                  "border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  "h-9.5 px-1 transition-all duration-300 ease-out",
                  isFocused ? "text-left" : "text-right",
                )}
                placeholder="Enter amount"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Right Action Buttons - Appear after text transition */}
        <div className="absolute right-1 flex items-center">
          <AnimatePresence mode="wait">
            {isFocused && (
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.2, // Wait for text transition to complete
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: 4,
                    transition: { duration: 0.1, delay: 0.02 },
                  }}
                  transition={{ duration: 0.15, delay: 0.1 }}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePermanentChange}
                    className="h-7 px-2 text-xs hover:bg-muted/80"
                    title="Change budget from now on"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Always
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: 4,
                    transition: { duration: 0.1, delay: 0 },
                  }}
                  transition={{ duration: 0.15, delay: 0.05 }}
                >
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleOverride}
                    className="h-7 px-2 text-xs"
                    title="Override for this period only"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    Once
                  </Button>
                </motion.div>

                {/* <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    transition: { duration: 0.1, delay: 0.04 },
                  }}
                  transition={{ duration: 0.15, delay: 0.15 }}
                >
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleConfirm}
                    className="h-7 px-2 text-xs"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </motion.div> */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Advanced Options Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced Budget Options
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Current budget:{" "}
              <span className="font-medium">{value.toLocaleString()} €</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Recurrence:{" "}
              <span className="font-medium capitalize">{recurrence}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Type:{" "}
              <span className="font-medium">
                {isRecurring ? "Recurring" : "One-time"}
              </span>
            </div>
            <div className="pt-4 text-center text-sm text-muted-foreground">
              Advanced options will be implemented here
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
