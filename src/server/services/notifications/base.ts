import type { CreateEmailOptions } from "resend";
import { z } from "zod";

import type { CreateActivityInput } from "./schemas";

export interface SpaceContext {
  id: string;
  name: string;
}

export type UserData = {
  id: string;
  full_name?: string;
  email: string;
  locale?: string;
  avatar_url?: string;
  organization_id: string;
  role?: "admin" | "owner" | "member";
};

export interface NotificationHandler<T = any> {
  schema: z.ZodSchema<T>;
  email?: {
    template: string;
    subject: string;
    from?: string;
    replyTo?: string;
  };
  createActivity: (data: T, user: UserData) => CreateActivityInput;
  createEmail?: (
    data: T,
    user: UserData,
    space: SpaceContext,
  ) => Partial<CreateEmailOptions> & {
    data: Record<string, any>;
    template?: string;
    emailType: "user" | "space" | "owners"; // Explicit: customer emails go to external recipients, team emails go to all team members, owners emails go to team owners only
  };
}

// Combine template data with all Resend options using intersection type
export type EmailInput = {
  template?: string;
  user: UserData;
  data: Record<string, any>;
} & Partial<CreateEmailOptions>;

// Use intersection type to combine our options with Resend's CreateEmailOptions
export type NotificationOptions = {
  priority?: number;
  sendEmail?: boolean;
} & Partial<CreateEmailOptions>;

export interface NotificationResult {
  type: string;
  activities: number;
  emails: {
    sent: number;
    skipped: number;
    failed?: number;
  };
}

// Common schemas
export const userSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  locale: z.string().optional(),
  image: z.string().optional(),
  defaultOrganizationId: z.uuid(),
  role: z.enum(["owner", "member"]).optional(),
});

export const transactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  category: z.string().optional(),
  status: z.string().optional(),
});
