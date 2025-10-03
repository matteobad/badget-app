import { z } from "zod";

export const toastSchema = z
  .object({
    visible: z.boolean(),
    currentStep: z.number().min(0),
    totalSteps: z.number().min(1),
    currentLabel: z.string(),
    stepDescription: z.string().optional(),
    completed: z.boolean().optional(),
    completedMessage: z.string().optional(),
  })
  .optional();
