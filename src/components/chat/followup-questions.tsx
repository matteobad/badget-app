"use client";

import { useEffect, useState } from "react";
import { useArtifact } from "@ai-sdk-tools/artifacts/client";
import { useChatActions, useChatId, useChatStatus } from "@ai-sdk-tools/store";
import { useChatInterface } from "~/hooks/use-chat-interface";
import { useChatStore } from "~/lib/stores/chat";
import { followupQuestionsArtifact } from "~/shared/validators/artifacts/followup-questions";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "../ui/button";

export function FollowupQuestions() {
  const { data } = useArtifact(followupQuestionsArtifact);
  const [isVisible, setIsVisible] = useState(false);
  const { sendMessage } = useChatActions();
  const { setChatId } = useChatInterface();
  const { resetCommandState } = useChatStore();
  const status = useChatStatus();
  const chatId = useChatId();

  const handleQuestionSelect = (question: string) => {
    if (chatId) {
      setChatId(chatId);

      sendMessage({
        role: "user",
        parts: [{ type: "text", text: question }],
      });

      resetCommandState();
    }
  };

  useEffect(() => {
    if (
      status !== "streaming" &&
      data?.questions &&
      data.questions.length > 0
    ) {
      // Small delay to allow for smooth animation
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [data]);

  if (!data?.questions || data.questions.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute right-0 bottom-full left-0 mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="relative">
            <motion.div
              className="flex items-center justify-start gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {data.questions.map((question, index) => (
                <motion.div
                  key={`followup-${question.slice(0, 20)}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 10, scale: 0.9 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 24,
                      },
                    },
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full border-border bg-background/95 px-3 text-xs whitespace-nowrap text-[#707070] backdrop-blur-md transition-colors hover:bg-accent/50"
                    onClick={() => handleQuestionSelect(question)}
                  >
                    {question}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
            {/* Right fade gradient to indicate more content */}
            <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
