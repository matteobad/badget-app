import { google } from "@ai-sdk/google";
import { generateText, smoothStream, streamText, tool } from "ai";
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import z from "zod";
import {
  getAssetsQuery,
  getLiabilitiesQuery,
} from "~/server/domain/bank-account/queries";
import { getNetWorthTrend } from "~/server/services/reports-service";
import { formatAmount } from "~/shared/helpers/format";
import { followupQuestionsArtifact } from "~/shared/validators/artifacts/followup-questions";
import { netWorthArtifact } from "~/shared/validators/artifacts/net-worth-artifact";

import { getContext } from "../../../context";
import { generateFollowupQuestions } from "../../../utils/generate-followup-questions";
import { safeValue } from "../../../utils/safe-value";

export const getNetWorthSchema = z.object({
  from: z
    .string()
    .default(() => startOfMonth(subMonths(new Date(), 12)).toISOString())
    .describe(
      "The start date when to retrieve data from. Defaults to 12 months ago. Return ISO-8601 format.",
    ),
  to: z
    .string()
    .default(() => endOfMonth(new Date()).toISOString())
    .describe(
      "The end date when to retrieve data from. Defaults to end of current month. Return ISO-8601 format.",
    ),
  currency: z
    .string()
    .describe("Optional currency code (e.g., 'EUR', 'USD').")
    .nullable()
    .optional(),
  showCanvas: z
    .boolean()
    .default(false)
    .describe(
      "Whether to show detailed visual analytics. Use true for in-depth analysis requests, trends, breakdowns, or when user asks for charts/visuals. Use false for simple questions or quick answers.",
    ),
});

export const getNetWorthAnalysisTool = tool({
  description:
    "Generate comprehensive net worth analysis with interactive visualizations, asset/liability breakdowns, historical trends, and actionable insights.",
  inputSchema: getNetWorthSchema.omit({ showCanvas: true }),
  execute: async function* ({ from, to, currency }) {
    try {
      const context = getContext();

      // Always create canvas for analysis tool
      const analysis = netWorthArtifact.stream({
        stage: "loading",
        currency: currency ?? context.user.baseCurrency ?? "EUR",
        toast: {
          visible: true,
          currentStep: 0,
          totalSteps: 4,
          currentLabel: "Loading net worth data",
          stepDescription: "Fetching assets and liabilities",
        },
      });

      // Generate a contextual initial message based on the analysis request
      const initialMessageStream = streamText({
        model: google("gemini-2.5-flash"),
        temperature: 0.2,
        system: `You are a financial assistant generating a brief initial message for a net worth analysis. 

The user has requested a net worth analysis for the period ${from} to ${to}. 
Create a message that:
- Acknowledges the specific time period being analyzed
- Explains what you're currently doing (gathering assets/liabilities)
- Mentions the insights they'll receive (net worth trend, asset allocation, liability breakdown)
- Uses a warm, professional tone
- Uses the user's first name (${safeValue(context?.user.fullName?.split(" ")[0]) || "there"}) when appropriate
- Shows genuine interest in their financial well-being
- Avoids generic phrases like "Got it! Let's dive into..." or "Thanks for reaching out"
- Keep it concise (1–2 sentences max)

Example format: "I'm analyzing your net worth data for [period] to show your net worth trend, assets, and liabilities."`,
        messages: [
          {
            role: "user",
            content: `Generate a brief initial message for a net worth analysis request for the period ${from} to ${to}.`,
          },
        ],
        experimental_transform: smoothStream({ chunking: "word" }),
      });

      let completeMessage = "";
      for await (const chunk of initialMessageStream.textStream) {
        completeMessage += chunk;
        yield { text: completeMessage };
      }

      // Add line breaks to prepare for the detailed analysis
      completeMessage += "\n";

      // Yield to continue processing while showing loading step
      yield { text: completeMessage };

      // Run all database queries in parallel for maximum performance
      const [netWorth, assets, liabilities] = await Promise.all([
        getNetWorthTrend(
          context.db,
          {
            from,
            to,
            currency: currency ?? undefined,
          },
          context.user.organizationId,
        ),
        getAssetsQuery(context.db, {
          organizationId: context.user.organizationId,
        }),
        getLiabilitiesQuery(context.db, {
          organizationId: context.user.organizationId,
        }),
      ]);

      const netWorthData = netWorth.result;

      // Early return if no data
      if (netWorthData.length === 0) {
        await analysis.update({
          stage: "analysis_ready",
          chart: { dailyData: [] },
          metrics: {
            currentNetWorth: 0,
            averageNetWorth: 0,
            netWorthChange: 0,
            netWorthChangePercentage: 0,
            topAsset: { name: "No data", percentage: 0, amount: 0 },
            topLiability: { name: "No data", percentage: 0, amount: 0 },
          },
          analysis: {
            summary: "No net worth data available for the selected period.",
            recommendations: ["Ensure accounts are linked", "Check date range"],
            netWorthChange: {
              percentage: 0,
              period: "0 days",
              startValue: 0,
              endValue: 0,
            },
          },
        });
        return { summary: "No data available" };
      }

      // Calculate basic metrics from burn rate data
      const currentNetWorth =
        netWorthData.length > 0
          ? (netWorthData[netWorthData.length - 1]?.amount ?? 0)
          : 0;

      const averageNetWorth =
        netWorthData.length > 0
          ? Math.round(
              netWorthData.reduce((sum, item) => sum + (item?.amount || 0), 0) /
                netWorthData.length,
            )
          : 0;

      // Generate daily chart data
      const fromDate = startOfDay(new Date(from));
      const toDate = endOfDay(new Date(to));
      const daySeries = eachDayOfInterval({ start: fromDate, end: toDate });

      const dailyData = daySeries.map((date, index) => {
        const value = netWorthData[index]?.amount ?? 0;

        return {
          date: format(date, "yyyy-MM-dd"),
          amount: value,
          average: averageNetWorth,
        };
      });

      // Update with chart data first
      await analysis.update({
        stage: "chart_ready",
        chart: { dailyData },
        toast: {
          visible: true,
          currentStep: 1,
          totalSteps: 4,
          currentLabel: "Preparing chart data",
          stepDescription:
            "Processing transaction data and calculating metrics",
        },
      });

      // Yield to continue processing while showing chart step
      yield { text: completeMessage };

      // Calculate burn rate change for metrics
      const netWorthStartValue =
        netWorthData.length > 0 ? (netWorthData[0]?.amount ?? 0) : 0;
      const netWorthEndValue = currentNetWorth;
      const netWorthChange = currentNetWorth - netWorthStartValue;
      const netWorthChangePercentage =
        netWorthStartValue > 0
          ? Math.round(
              ((netWorthEndValue - netWorthStartValue) / netWorthStartValue) *
                100,
            )
          : 0;
      const netWorthChangePeriod = `${netWorthData.length} days`;

      const topAsset = assets[0]
        ? {
            name: assets[0].name,
            amount: assets[0].balance,
            percentage: assets[0].percentage,
          }
        : { name: "None", amount: 0, percentage: 0 };
      const topLiability = liabilities[0]
        ? {
            name: liabilities[0].name,
            amount: liabilities[0].balance,
            percentage: liabilities[0].percentage,
          }
        : {
            name: "None",
            amount: 0,
            percentage: 0,
          };

      // Update with metrics data including burn rate change
      await analysis.update({
        stage: "metrics_ready",
        chart: {
          dailyData,
        },
        metrics: {
          currentNetWorth,
          averageNetWorth,
          netWorthChange,
          netWorthChangePercentage,
          topAsset,
          topLiability,
        },
        analysis: {
          netWorthChange: {
            percentage: netWorthChangePercentage,
            period: netWorthChangePeriod,
            startValue: netWorthStartValue,
            endValue: netWorthEndValue,
          },
          summary: "Loading analysis...",
          recommendations: [],
        },
        toast: {
          visible: true,
          currentStep: 2,
          totalSteps: 4,
          currentLabel: "Metrics ready",
          stepDescription: "Generating visual charts and analytics",
        },
      });

      // Yield to continue processing while showing metrics step
      yield { text: completeMessage };

      // Get the target currency for display
      const targetCurrency = currency ?? context.user.baseCurrency ?? "EUR";

      // Show AI processing step
      await analysis.update({
        toast: {
          visible: true,
          currentStep: 3,
          totalSteps: 4,
          currentLabel: "Generating insights",
          stepDescription: "Running AI analysis and generating insights",
        },
      });

      // Yield to continue processing while showing AI processing step
      yield { text: completeMessage };

      // Generate AI summary with a simpler, faster prompt
      const analysisResult = await generateText({
        model: google("gemini-2.5-flash"),
        messages: [
          {
            role: "user",
            content: `Analyze this net worth data:

Current Net Worth: ${formatAmount({
              amount: currentNetWorth,
              currency: targetCurrency,
            })}
Change: ${netWorthChangePercentage}% over ${netWorthData.length} days
Top Asset: ${topAsset.name} (${topAsset.percentage}%)
Top Liability: ${topLiability.name} (${topLiability.amount})

Provide a concise 2-sentence summary and 2-3 brief recommendations.`,
          },
        ],
      });

      // Simple parsing - just split by line breaks and take first few lines
      const responseText = analysisResult.text;
      const lines = responseText
        .split("\n")
        .filter((line) => line.trim().length > 0);

      const summaryText =
        lines[0] ??
        `Current net worth: ${formatAmount({
          amount: currentNetWorth,
          currency: targetCurrency,
        })}.`;
      const recommendations = lines
        .slice(1, 4)
        .map((line) => line.replace(/^[-•*]\s*/, "").trim());

      // Final update with all data and completion
      await analysis.update({
        stage: "analysis_ready",
        chart: { dailyData },
        metrics: {
          currentNetWorth,
          averageNetWorth,
          netWorthChange,
          netWorthChangePercentage,
          topAsset,
          topLiability,
        },
        analysis: {
          summary: summaryText,
          recommendations,
          netWorthChange: {
            percentage: netWorthChangePercentage,
            period: netWorthChangePeriod,
            startValue: netWorthStartValue,
            endValue: netWorthEndValue,
          },
        },
        toast: {
          visible: false,
          currentStep: 4,
          totalSteps: 4,
          currentLabel: "Analysis complete",
          stepDescription: "Net worth analysis complete",
          completed: true,
          completedMessage: "Net worth analysis complete",
        },
      });

      // Prepare data for streaming response
      const netWorthAnalysisData = {
        currentNetWorth: formatAmount({
          amount: currentNetWorth,
          currency: targetCurrency,
        }),
        netWorthChange,
        netWorthChangePercentage,
        topAsset,
        topLiability,
      };

      // Stream the detailed analysis to extend the initial message
      const responseStream = streamText({
        model: google("gemini-2.5-flash"),
        system: `You are a financial assistant providing a net worth analysis. 
Generate ONLY the detailed analysis section using the exact data provided.

REQUIRED FORMAT:
## Net Worth Overview
Your current net worth is {currentNetWorth}. 
This reflects a {increase/decrease/stable} of {netWorthChangePercentage}% over the past period.

## Asset Allocation
Your largest asset category is {topAsset.name}, representing {topAsset.percentage}% of your total assets.

## Liabilities
Your main liability is {topLiability.name}, with a value of {topLiability.amount}.

## Trends and Insights
Your net worth has {trend} by {netWorthChangePercentage}% over the last ${netWorthData.length} days.`,
        messages: [
          {
            role: "user",
            content: `Generate a net worth analysis using this exact data: ${JSON.stringify(
              netWorthAnalysisData,
            )}`,
          },
        ],
        experimental_transform: smoothStream({ chunking: "word" }),
      });

      // Yield the streamed response
      let analysisText = "";
      for await (const chunk of responseStream.textStream) {
        analysisText += chunk;
        yield { text: completeMessage + analysisText };
      }

      // Update completeMessage with the final analysis
      completeMessage += analysisText;

      // Generate follow-up questions based on the analysis output
      const followups = await generateFollowupQuestions(
        "getNetWorthAnalysis",
        this.description ?? "",
        completeMessage,
      );

      // Stream follow-up questions artifact
      const followupStream = followupQuestionsArtifact.stream({
        questions: followups,
        context: "net_worth_analysis",
      });

      await followupStream.complete();

      // Yield the final response with forceStop flag
      // Always stop for analysis tool since canvas is complete
      yield {
        text: completeMessage,
        forceStop: true,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});
