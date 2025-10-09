import { google } from "@ai-sdk/google";
import { generateText, smoothStream, streamText, tool } from "ai";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { z } from "zod";
import { getExpensesByCategory } from "~/server/services/reports-service";
import { formatAmount } from "~/shared/helpers/format";
import { expensesBreakdownArtifact } from "~/shared/validators/artifacts/expenses-breakdown";
import { followupQuestionsArtifact } from "~/shared/validators/artifacts/followup-questions";

import { getContext } from "../../../context";
import { generateFollowupQuestions } from "../../../utils/generate-followup-questions";
import { safeValue } from "../../../utils/safe-value";

export const getExpensesBreakdownSchema = z.object({
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
    .describe("Optional currency code (e.g., 'USD', 'SEK').")
    .nullable()
    .optional(),
  showCanvas: z
    .boolean()
    .default(false)
    .describe(
      "Whether to show detailed visual analytics. Use true for in-depth analysis requests, trends, breakdowns, or when user asks for charts/visuals. Use false for simple questions or quick answers.",
    ),
});

export const getExpensesBreakdownTool = tool({
  description:
    "Generate an expenses breakdown with visualizations, category analysis, and insights on spending distribution.",
  inputSchema: getExpensesBreakdownSchema.omit({ showCanvas: true }),
  execute: async function* ({ from, to, currency }) {
    try {
      const context = getContext();

      // Always create canvas for analysis tool
      const analysis = expensesBreakdownArtifact.stream({
        stage: "loading",
        currency: currency ?? context.user.baseCurrency ?? "EUR",
        toast: {
          visible: true,
          currentStep: 0,
          totalSteps: 4,
          currentLabel: "Loading expenses data",
          stepDescription: "Fetching categorized expenses",
        },
      });

      // Generate a contextual initial message based on the analysis request
      const initialMessageStream = streamText({
        model: google("gemini-2.5-flash"),
        temperature: 0.2,
        system: `
          You are a financial assistant generating a short initial message for an expenses breakdown analysis.

          The user has requested an expenses breakdown for the period ${from} to ${to}. 
          Create a message that:
          - Acknowledges the specific time period being analyzed
          - Explains what you're currently doing (gathering expenses by category)
          - Mentions the insights they'll receive (expenses by category, spending distribution)
          - Uses a warm, professional tone
          - Uses the user's first name (${safeValue(context?.user.fullName?.split(" ")[0]) || "there"}) when appropriate
          - Shows genuine interest in their financial well-being
          - Avoids generic phrases like "Got it! Let's dive into..." or "Thanks for reaching out"
          - Keep it concise (1–2 sentences max)
        `,
        messages: [
          {
            role: "user",
            content: `Generate a short initial message for an expenses breakdown analysis (${from} to ${to}).`,
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
      const expensesByCategory = await getExpensesByCategory(
        context.db,
        {
          limit: 10,
          from,
          to,
        },
        context.user.organizationId,
      );

      const expenses = expensesByCategory.result.categories;

      // Early return if no data
      if (expenses.length === 0) {
        await analysis.update({
          stage: "analysis_ready",
          chart: { categoryData: [] },
          metrics: {
            total: 0,
            topCategory: { name: "No data", percentage: 0, amount: 0 },
            recurringExpenses: { amount: 0, percentage: 0 },
            uncategorizedTransactions: { amount: 0, percentage: 0 },
          },
          analysis: {
            summary: "No expenses data available for this period.",
            recommendations: ["Check accounts", "Verify categories"],
          },
        });
        return { summary: "No data available" };
      }

      // Update with chart data first
      await analysis.update({
        stage: "chart_ready",
        chart: { categoryData: expenses },
        toast: {
          visible: true,
          currentStep: 1,
          totalSteps: 4,
          currentLabel: "Preparing chart",
          stepDescription: "Building expense categories visualization",
        },
      });

      // Yield to continue processing while showing chart step
      yield { text: completeMessage };

      // Calculate  metrics from expenses data
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      const topCategory = expenses[0]!;

      // Update with metrics data including burn rate change
      await analysis.update({
        stage: "metrics_ready",
        chart: { categoryData: expenses },
        metrics: {
          total,
          topCategory,
          recurringExpenses: { amount: 0, percentage: 0 },
          uncategorizedTransactions: { amount: 0, percentage: 0 },
        },
        analysis: {
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

      // AI summary
      const targetCurrency = currency ?? context.user.baseCurrency ?? "EUR";
      const analysisResult = await generateText({
        model: google("gemini-2.5-flash"),
        messages: [
          {
            role: "user",
            content: `
              Analyze these expenses by category:

              Total: ${formatAmount({ amount: total, currency: targetCurrency })}
              Top Category: ${topCategory.name} (${topCategory.percentage}%)

              Generate:
              - 2-sentence summary
              - 2-3 recommendations for improving spending.
            `,
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
        `Total expenses: ${formatAmount({
          amount: total,
          currency: targetCurrency,
        })}.`;
      const recommendations = lines
        .slice(1, 4)
        .map((l) => l.replace(/^[-•*]\s*/, "").trim());

      // Final update with all data and completion
      await analysis.update({
        stage: "analysis_ready",
        chart: { categoryData: expenses },
        metrics: {
          total,
          topCategory,
          recurringExpenses: { amount: 0, percentage: 0 },
          uncategorizedTransactions: { amount: 0, percentage: 0 },
        },
        analysis: {
          summary: summaryText,
          recommendations,
        },
        toast: {
          visible: false,
          currentStep: 4,
          totalSteps: 4,
          currentLabel: "Analysis complete",
          stepDescription: "Expenses breakdown complete",
          completed: true,
          completedMessage: "Expenses breakdown complete",
        },
      });

      // Prepare data for streaming response
      const expensesData = {
        total: formatAmount({ amount: total, currency: targetCurrency }),
        topCategory: topCategory.name,
        topCategoryPercentage: topCategory.percentage,
      };

      // Prepare data for streaming response
      const responseStream = streamText({
        model: google("gemini-2.5-flash"),
        system: `
          You are a financial assistant providing an expenses breakdown.
          Generate ONLY the detailed analysis with the exact data provided.

          REQUIRED FORMAT:
          ## Total Expenses
          Your total expenses were {total}.

          ## Top Category
          Your largest expense was {topCategory}, representing {topCategoryPercentage}% of your total.

          ## Spending Distribution
          The chart shows how your spending is distributed across categories.

          ## Insights
          Provide 2–3 insights about the balance of spending categories.
        `,
        messages: [
          {
            role: "user",
            content: `Generate an expenses breakdown using this data: ${JSON.stringify(
              expensesData,
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
        "getExpensesBreakdown",
        this.description ?? "",
        completeMessage,
      );

      // Stream follow-up questions artifact
      await followupQuestionsArtifact
        .stream({
          questions: followups,
          context: "expenses_breakdown",
        })
        .complete();

      // Yield the final response with forceStop flag
      // Always stop for analysis tool since canvas is complete
      yield {
        text: completeMessage,
        forceStop: true,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
});
