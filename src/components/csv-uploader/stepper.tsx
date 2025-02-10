import React, { createContext, useContext, useState } from "react";

import { cn } from "~/lib/utils";

export type Step<S> = {
  label: S;
  content: React.ReactNode;
};

type StepperContext<T, S> = {
  activeStep: number;
  setActiveStep: (newStep: number) => void;
  navigateTo: (id: Step<S>["label"]) => void;
  handleSetData: (partial: Partial<T>) => void;
  data: T;
  steps: Step<S>[];
};

const StepperContext = createContext<StepperContext<any, any> | null>(null);

export const useStepper = <T, S>(): StepperContext<T, S> => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a StepperProvider");
  }

  return context;
};

export const StepperProvider = <T, S extends string>({
  initialData,
  steps,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  initialData: T;
  steps: Step<S>[];
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [data, setData] = useState<T>(initialData);

  const handleSetData: StepperContext<T, S>["handleSetData"] = (partial) =>
    setData((prev) => ({ ...prev, ...partial }));

  const navigateTo = React.useCallback(
    () => (id: Step<S>["label"]) => {
      setActiveStep(steps.findIndex((step) => step.label === id));
    },
    [steps],
  );

  const contextValue = React.useMemo<StepperContext<T, S>>(
    () => ({
      activeStep,
      setActiveStep,
      navigateTo,
      data,
      handleSetData,
      steps,
    }),
    [activeStep, data, navigateTo, steps],
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        className={cn("group/stepper flex w-full", className)}
        {...props}
      ></div>
      {children}
    </StepperContext.Provider>
  );
};
