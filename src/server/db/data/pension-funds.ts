import { relations } from "drizzle-orm";
import {
  date,
  decimal,
  integer,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { pgTable } from "../schema/_table";
import { timestamps } from "../utils";

export const PensionFundType = {
  FPN: "Fondo negoziale",
  FPA: "Fondo aperto",
  PIP: "Fondo PIP",
  FP1: "Fondo preesistente - Sezione 1",
  FP2: "Fondo preesistente - Sezione 2",
  FP3: "Fondo preesistente - Sezione 3",
  UNKNOWN: "UNKNOWN",
} as const;
export type PensionFundType =
  (typeof PensionFundType)[keyof typeof PensionFundType];

export const pensionFunds = pgTable("pension_funds", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 512 }).notNull(),
  type: text("type").$type<PensionFundType>().notNull(),
  registrationNumber: integer("registration_number").unique().notNull(),
  registrationOffice: varchar("registered_office", { length: 128 }),
  registrationDate: date("registration_date", { mode: "string" }),
  legalForm: varchar("legal_form", { length: 128 }),
  suvervisionedSince: date("suvervisioned_since", { mode: "string" }),
  iscLink: varchar("isc_link", { length: 2048 }),

  ...timestamps,
});

export const pensionFundsRelations = relations(pensionFunds, ({ many }) => ({
  investmentsBranches: many(investmentBranches),
}));

export const BranchCategory = {
  AZN: "AZN",
  BIL: "BIL",
  GAR: "GAR",
  OBB: "OBB",
  UNKNOWN: "UNKNOWN",
} as const;
export type BranchCategory =
  (typeof BranchCategory)[keyof typeof BranchCategory];

export const investmentBranches = pgTable("investment_branches", {
  id: serial("id").primaryKey(),

  // FK
  pensionFundId: integer("pension_fund_id"),

  description: varchar("description", { length: 256 }),
  category: text("category").$type<BranchCategory>(),
  isc2: real("isc_2"),
  isc5: real("isc_5"),
  isc10: real("isc_10"),
  isc35: real("isc_35"),
  averageReturns: real("average_returns"),

  ...timestamps,
});

export const investmentBranchesRelations = relations(
  investmentBranches,
  ({ one, many }) => ({
    pensionFund: one(pensionFunds, {
      fields: [investmentBranches.pensionFundId],
      references: [pensionFunds.id],
    }),
    performances: many(investmentBranchesPerf),
  }),
);

export const investmentBranchesPerf = pgTable("investment_branches_perf", {
  id: serial("id").primaryKey(),

  // FK
  branchId: integer("investment_branch_id").notNull(),

  date: timestamp("date", { withTimezone: true }),
  yield1: real("yield_1"),
  yield3: real("yield_3"),
  yield5: real("yield_5"),
  yield10: real("yield_10"),
  yield20: real("yield_20"),

  ...timestamps,
});

export const investmentBranchesPerfRelations = relations(
  investmentBranchesPerf,
  ({ one }) => ({
    investmentBranch: one(investmentBranches, {
      fields: [investmentBranchesPerf.branchId],
      references: [investmentBranches.id],
    }),
  }),
);

// Domain data
export const pensionAccounts = pgTable("pension_accounts", {
  id: serial("id").primaryKey(),

  // FK
  pensionFundId: integer("pension_fund_id").notNull(),
  investmentBranchId: integer("investment_branch_id").notNull(),
  userId: varchar("user_id", { length: 512 }).notNull(),

  joinedAt: timestamp("joined_at"),
  baseTFRPercentage: real("base_tfr_percentage").default(0),
  baseEmployeePercentage: real("base_employee_percentage").default(0),
  baseEmployerPercentage: real("base_employer_percentage").default(0),

  ...timestamps,
});

export const pensionAccountsRelations = relations(
  pensionAccounts,
  ({ one, many }) => ({
    contributions: many(pensionContributions),
    pensionFund: one(pensionFunds, {
      fields: [pensionAccounts.pensionFundId],
      references: [pensionFunds.id],
    }),
  }),
);

export const ContributionContributor = {
  TFR: "TFR",
  EMPLOYEE: "EMPLOYEE",
  EMPLOYER: "EMPLOYER",
  UNKNOWN: "UNKNOWN",
} as const;
export type ContributionContributor =
  (typeof ContributionContributor)[keyof typeof ContributionContributor];

export const pensionContributions = pgTable("pension_contributions", {
  id: serial("id").primaryKey(),

  // FK
  pensionAccountId: integer("pension_account_id").notNull(),

  amount: decimal("amount").default("0"),
  contributor: text("contributor").$type<ContributionContributor>(),
  date: timestamp("date", { withTimezone: true }),
  consolidatedAt: timestamp("consolidated_at", { withTimezone: true }),

  ...timestamps,
});

export const pensionContributionsRelations = relations(
  pensionContributions,
  ({ one }) => ({
    pensionAccount: one(pensionAccounts, {
      fields: [pensionContributions.pensionAccountId],
      references: [pensionAccounts.id],
    }),
  }),
);
