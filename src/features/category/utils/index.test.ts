import { BUDGET_PERIOD } from "~/server/db/schema/enum";
import { describe, expect, it } from "bun:test";
import { parseISO } from "date-fns";

import { computeBudgetOfCompetence } from "./index";

const date = (str: string) => parseISO(str);

describe("computeBudgetOfCompetence", () => {
  it("returns 0 if budget is null", () => {
    const result = computeBudgetOfCompetence(
      null,
      date("2025-04-01"),
      date("2025-04-30"),
    );
    expect(result).toBe(0);
  });

  it("ignores budget outside of target period", () => {
    const budget = {
      amount: "400",
      period: "month" as const,
      startDate: date("2025-01-01"),
      endDate: date("2025-03-31"),
    };
    const result = computeBudgetOfCompetence(
      budget,
      date("2025-04-01"),
      date("2025-04-30"),
    );
    expect(result).toBe(0);
  });

  it("calculates weekly budget with open end correctly (April 2025)", () => {
    const budget = {
      amount: "100",
      period: BUDGET_PERIOD.WEEKLY,
      startDate: date("2025-04-01"),
      endDate: null,
    };
    const result = computeBudgetOfCompetence(
      budget,
      date("2025-04-01"),
      date("2025-04-30"),
    );

    // Breakdown:
    // 4 intere settimane (4 * 100 = 400)
    // + 2 giorni (29, 30 aprile) = 2/7 * 100 = ~28.57
    // Totale ≈ 428.57
    expect(result).toBeCloseTo(428.57, 2);
  });

  it("calculates custom period proportionally", () => {
    const budget = {
      amount: "1000",
      period: "custom" as const,
      startDate: date("2025-04-01"),
      endDate: date("2025-04-20"),
    };
    const result = computeBudgetOfCompetence(
      budget,
      date("2025-04-10"),
      date("2025-04-30"),
    );

    // Custom budget copre 20 giorni (1 → 20 aprile)
    // Intersezione: 10 → 20 aprile = 11 giorni
    // 11 / 20 * 1000 = 550
    expect(result).toBeCloseTo(550, 2);
  });

  it("calculates full inclusion correctly", () => {
    const budget = {
      amount: "400",
      period: "month" as const,
      startDate: date("2025-04-01"),
      endDate: date("2025-06-30"),
    };
    const result = computeBudgetOfCompetence(
      budget,
      date("2025-04-01"),
      date("2025-04-30"),
    );

    // Aprile è pienamente coperto → 1 mese = 400
    expect(result).toBe(400);
  });
});
