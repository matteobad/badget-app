import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  integer,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable } from "./_table";

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

export const pensionFunds = createTable("pension_funds", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  name: varchar("name", { length: 512 }).notNull(),
  type: text("type").$type<PensionFundType>().notNull(),
  registrationNumber: integer("registration_number").notNull(),
  registrationOffice: varchar("registered_office", { length: 128 }),
  registrationDate: date("registration_date", { mode: "string" }),
  legalForm: varchar("legal_form", { length: 128 }),
  suvervisionedSince: date("suvervisioned_since", { mode: "string" }),
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
  UNKNOWN: "UNKNOWN",
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

  description: varchar("description", { length: 256 }),
  category: text("category").$type<BranchCategory>(),
  isc2: real("isc_2"),
  isc5: real("isc_5"),
  isc10: real("isc_10"),
  isc35: real("isc_35"),
  averageReturns: real("average_returns"),
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

// Domain data
export const pensionAccounts = createTable("pension_accounts", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  pensionFundId: integer("pension_fund_id").notNull(),
  investmentBranchId: integer("investment_branch_id").notNull(),
  userId: varchar("name", { length: 512 }).notNull(),

  joinedAt: timestamp("joined_at"),
  baseTFRPercentage: real("base_tfr_percentage").default(0),
  baseEmployeePercentage: real("base_employee_percentage").default(0),
  baseEmployerPercentage: real("base_employer_percentage").default(0),
});

export const pensionAccountsRelations = relations(
  pensionAccounts,
  ({ many }) => ({
    contributions: many(pensionAccountContributions),
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

export const pensionAccountContributions = createTable(
  "pension_account_contributions",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),

    // FK
    pensionAccountId: integer("pension_account_id").notNull(),

    amount: decimal("amount").default("0"),
    contributor: text("contributor").$type<ContributionContributor>(),
    date: timestamp("date", { withTimezone: true }),
    consolidated_at: timestamp("consolidated_at", { withTimezone: true }),
  },
);

export const pensionAccountContributionsRelations = relations(
  pensionAccountContributions,
  ({ one }) => ({
    pensionFund: one(pensionAccounts, {
      fields: [pensionAccountContributions.pensionAccountId],
      references: [pensionAccounts.id],
    }),
  }),
);
