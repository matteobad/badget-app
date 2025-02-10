"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";

import { cn } from "~/lib/utils";
import { Panel, PanelContent, PanelProvider } from "./panel";

export const BackfillStep = {
  UPLOAD: "upload",
  MAPPING: "mapping",
  IMPORT: "import",
  DONE: "done",
} as const;
export type BackfillStep = (typeof BackfillStep)[keyof typeof BackfillStep];

function BackfillSteps({ currentStep }: { currentStep: BackfillStep }) {
  const steps = Object.values(BackfillStep);
  const currentStepIndex = steps.findIndex(
    (step) => step.toLowerCase() === currentStep,
  );

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step} className="relative flex flex-col items-center">
          <div className="flex h-8 w-12 items-center justify-center">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full",
                {
                  "bg-muted": index <= currentStepIndex,
                },
              )}
            >
              {index < currentStepIndex ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
          </div>
          <span className="mt-1 text-xs">{step}</span>
          {index < steps.length - 1 && (
            <div
              className={`absolute left-full top-4 h-0.5 w-full -translate-y-1/2 ${
                index < currentStepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function BackfillPanel() {
  const [params, setParams] = useQueryStates({ action: parseAsString });

  return (
    <PanelProvider
      open={params.action === "backfill"}
      onOpenChange={() => {
        void setParams({ action: null });
      }}
    >
      <Panel title="Backfill Transaction" description="">
        <PanelContent>
          <div className="flex flex-col gap-4">
            <BackfillSteps currentStep={BackfillStep.UPLOAD} />
          </div>
        </PanelContent>
      </Panel>
    </PanelProvider>
  );
}
