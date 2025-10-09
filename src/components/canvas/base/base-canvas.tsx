"use client";

import { useArtifacts } from "@ai-sdk-tools/artifacts/client";
import { cn } from "~/lib/utils";

import { ProgressToast } from "./progress-toast";

export function BaseCanvas({ children }: { children: React.ReactNode }) {
  const { current } = useArtifacts({
    exclude: ["chat-title", "followup-questions"],
  });
  const isCanvasVisible = !!current;

  // @ts-expect-error TODO: fix this
  const toastData = current?.payload?.toast;

  return (
    <div
      className={cn(
        "fixed top-[88px] right-4 z-30 w-[579px]",
        "border border-[#e6e6e6] bg-white dark:border-[#1d1d1d] dark:bg-[#0c0c0c]",
        "overflow-x-hidden overflow-y-auto transition-transform duration-300 ease-in-out",
        isCanvasVisible ? "translate-x-0" : "translate-x-[calc(100%+24px)]",
      )}
      style={{ height: "calc(100vh - 104px)" }}
    >
      <div className="relative flex h-full flex-col px-6 py-4">
        {children}

        {toastData && (
          <ProgressToast
            isVisible={toastData.visible}
            currentStep={toastData.currentStep}
            totalSteps={toastData.totalSteps}
            currentLabel={toastData.currentLabel}
            stepDescription={toastData.stepDescription}
            completed={toastData.completed}
            completedMessage={toastData.completedMessage}
          />
        )}
      </div>
    </div>
  );
}
