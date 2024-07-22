import { relations, sql } from "drizzle-orm";
import {
  date,
  decimal,
  integer,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable } from "./_table";

export const PensionFundType = {
  FPN: "FPN",
  FPA: "FPA",
  PIP: "PIP",
} as const;
export type PensionFundType =
  (typeof PensionFundType)[keyof typeof PensionFundType];

export const pensionFunds = createTable("pension_funds", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  name: varchar("name", { length: 128 }).notNull(),
  type: text("type").$type<PensionFundType>().notNull(),
  registrationNumber: integer("registration_number").notNull(),
  registrationOffice: varchar("registered_office", { length: 128 }),
  registrationDate: date("registration_date", { mode: "string" }),
  legalForm: varchar("legal_form", { length: 128 }),
  suvervisionedSince: date("registration_date", { mode: "string" }),
  iscLink: varchar("isc_link", { length: 2048 }),
});

export const pensionFundsRelations = relations(pensionFunds, ({ many }) => ({
  investmentsBranches: many(investmentBranches),
}));

export const BranchCategory = {
  AZN: "AZN",
  BIL: "BIL",
  GAR: "GAR",
  OBB: "OBB",
} as const;
export type BranchCategory =
  (typeof BranchCategory)[keyof typeof BranchCategory];

export const investmentBranches = createTable("investment_branches", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  pensionFundId: integer("pension_fund_id"),

  description: varchar("description", { length: 256 }).notNull(),
  category: text("category").$type<BranchCategory>().notNull(),
  isc2: decimal("isc_2", { precision: 2 }),
  isc5: decimal("isc_5", { precision: 2 }),
  isc10: decimal("isc_10", { precision: 2 }),
  isc35: decimal("isc_35", { precision: 2 }),
  averageReturns: decimal("average_returns", { precision: 2 }),
});

export const investmentBranchesRelations = relations(
  investmentBranches,
  ({ one }) => ({
    pensionFund: one(pensionFunds, {
      fields: [investmentBranches.pensionFundId],
      references: [pensionFunds.id],
    }),
  }),
);
