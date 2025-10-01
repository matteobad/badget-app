"use client";

import { useArtifact } from "@ai-sdk-tools/artifacts/client";
import { useUserQuery } from "~/hooks/use-user";
import { expensesBreakdownArtifact } from "~/server/domain/ai/artifacts/expenses-breakdown";
import { formatAmount } from "~/shared/helpers/format";

import { ExpensesChart } from "../charts";
import { BaseCanvas } from "./base/base-canvas";
import { CanvasChart } from "./base/canvas-chart";
import { CanvasContent } from "./base/canvas-content";
import { CanvasGrid } from "./base/canvas-grid";
import { CanvasHeader } from "./base/canvas-header";
import { CanvasSection } from "./base/canvas-section";

export function CategoryExpensesCanvas() {
  const { data, status } = useArtifact(expensesBreakdownArtifact);
  const { data: user } = useUserQuery();

  const isLoading = status === "loading";
  const stage = data?.stage;

  // Use artifact data or fallback to empty/default values
  const categoryData =
    data?.chart?.categoryData.map((item) => {
      return {
        name: item.name,
        value: item.amount,
        color: item.color,
      };
    }) ?? [];

  const expensesBreakdownMetrics = data?.metrics
    ? [
        {
          id: "total-expenses",
          title: "Total Expenses",
          value: formatAmount({
            currency: data.currency,
            amount: data.metrics.total || 0,
            locale: user?.locale,
          }),
          subtitle: "No change data",
        },
        {
          id: "top-category",
          title: "Top Category",
          value: formatAmount({
            currency: data.currency,
            amount: data.metrics.topCategory?.amount || 0,
            locale: user?.locale,
          }),
          subtitle: `${data.metrics.topCategory?.percentage || 0}%`,
        },
        {
          id: "recurring-expenses",
          title: "Recurring Expenses",
          value: formatAmount({
            currency: data.currency,
            amount: data.metrics.recurringExpenses?.amount || 0,
            locale: user?.locale,
          }),
          subtitle: `${data.metrics.recurringExpenses?.percentage || 0}%`,
        },
        {
          id: "uncategorized-transactions",
          title: "Uncategorized Transactions",
          value: formatAmount({
            currency: data.currency,
            amount: data.metrics.uncategorizedTransactions?.amount || 0,
            locale: user?.locale,
          }),
          subtitle: `${data.metrics.uncategorizedTransactions?.percentage || 0}%`,
        },
      ]
    : [];

  const legendItems = categoryData.map((item) => ({
    label: item.name,
    type: "solid" as const,
    color: item.color,
  }));

  const showChart =
    stage &&
    ["loading", "chart_ready", "metrics_ready", "analysis_ready"].includes(
      stage,
    );

  const showSummarySkeleton = !stage || stage !== "analysis_ready";

  return (
    <BaseCanvas>
      <CanvasHeader title="Analysis" isLoading={isLoading} />

      <CanvasContent>
        <div className="space-y-8">
          {/* Show chart as soon as we have net worth data */}
          {showChart && (
            <CanvasChart
              title="Category Expense Breakdown"
              legend={{ items: legendItems }}
              isLoading={stage === "loading"}
              height="20rem"
            >
              <ExpensesChart
                data={[]}
                categoryData={categoryData}
                height={320}
                showLegend={false}
                chartType="pie"
              />
            </CanvasChart>
          )}

          {/* Always show metrics section */}
          <CanvasGrid
            items={expensesBreakdownMetrics}
            layout="2/2"
            isLoading={stage === "loading" || stage === "chart_ready"}
          />

          {/* Always show summary section */}
          <CanvasSection title="Summary" isLoading={showSummarySkeleton}>
            {data?.analysis?.summary}
          </CanvasSection>
        </div>
      </CanvasContent>
    </BaseCanvas>
  );
}
