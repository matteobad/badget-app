"use client";

import { useArtifact } from "@ai-sdk-tools/artifacts/client";
import { useUserQuery } from "~/hooks/use-user";
import { formatAmount } from "~/shared/helpers/format";
import { netWorthArtifact } from "~/shared/validators/artifacts/net-worth-artifact";

import { NetWorthChart } from "../charts/net-worth-chart";
import { BaseCanvas } from "./base/base-canvas";
import { CanvasChart } from "./base/canvas-chart";
import { CanvasContent } from "./base/canvas-content";
import { CanvasGrid } from "./base/canvas-grid";
import { CanvasHeader } from "./base/canvas-header";
import { CanvasSection } from "./base/canvas-section";

export function NetWorthCanvas() {
  const { data, status } = useArtifact(netWorthArtifact);
  const { data: user } = useUserQuery();

  const isLoading = status === "loading";
  const stage = data?.stage;

  // Use artifact data or fallback to empty/default values
  const netWorthData =
    data?.chart?.dailyData?.map((item) => ({
      date: item.date,
      amount: item.amount,
      average: item.average,
    })) ?? [];

  const netWorthMetrics = data?.metrics
    ? [
        {
          id: "current-net-worth",
          title: "Current Net Worth",
          value:
            formatAmount({
              currency: data.currency,
              amount: data.metrics.currentNetWorth || 0,
              locale: user?.locale,
            }) || (data.metrics.currentNetWorth || 0).toLocaleString(),
          subtitle: data.analysis?.netWorthChange
            ? `${data.analysis.netWorthChange.percentage}% vs ${data.analysis.netWorthChange.period}`
            : stage === "loading"
              ? "Loading..."
              : "No change data",
        },
        {
          id: "average-net-worth",
          title: "Average Net Worth",
          value:
            formatAmount({
              currency: data.currency,
              amount: data.metrics.averageNetWorth || 0,
              locale: user?.locale,
            }) || (data.metrics.averageNetWorth || 0).toLocaleString(),
          subtitle: `Over last ${data.chart?.dailyData?.length || 0} days`,
        },
        {
          id: "highest-asset",
          title: data.metrics.topAsset?.name || "Top Asset",
          value: `${data.metrics.topAsset?.percentage || 0}%`,
          subtitle: `${
            formatAmount({
              currency: data.currency,
              amount: data.metrics.topAsset?.amount || 0,
              locale: user?.locale,
            }) || (data.metrics.topAsset?.amount || 0).toLocaleString()
          } of net worth`,
        },
        {
          id: "highest-liability",
          title: data.metrics.topLiability?.name || "Top Liability",
          value: `${data.metrics.topLiability?.percentage || 0}%`,
          subtitle: `${
            formatAmount({
              currency: data.currency,
              amount: data.metrics.topLiability?.amount || 0,
              locale: user?.locale,
            }) || (data.metrics.topLiability?.amount || 0).toLocaleString()
          } of net worth`,
        },
      ]
    : [];

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
              title="Net Worth Trend"
              legend={{
                items: [
                  { label: "Current", type: "solid" },
                  { label: "Average", type: "pattern" },
                ],
              }}
              isLoading={stage === "loading"}
              height="20rem"
            >
              <NetWorthChart
                data={netWorthData}
                height={320}
                showLegend={false}
                currency={data?.currency || "EUR"}
                locale={user?.locale ?? undefined}
              />
            </CanvasChart>
          )}

          {/* Always show metrics section */}
          <CanvasGrid
            items={netWorthMetrics}
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
