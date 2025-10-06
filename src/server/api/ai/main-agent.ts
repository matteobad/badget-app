import type { ChatUserContext } from "~/server/cache/chat-cache";
import type { InferUITools, UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { TZDate } from "@date-fns/tz";
import { Experimental_Agent as Agent, stepCountIs } from "ai";

import { getAccountsTool } from "./domains/expenses/tools/get-accounts-tool";
import { getInstitutionsTool } from "./domains/expenses/tools/get-institutions-tool";
import { getTransacationsCategoriesTool } from "./domains/expenses/tools/get-transactions-categories-tool";
import { getTransacationsTagsTool } from "./domains/expenses/tools/get-transactions-tags-tool";
import { getTransactionsTool } from "./domains/expenses/tools/get-transactions-tool";
import { safeValue } from "./utils/safe-value";
import { shouldForceStop } from "./utils/streaming-utils";

const generateBasePrompt = (userContext: ChatUserContext) => {
  const userTimezone = userContext.timezone ?? "UTC";
  const tzDate = new TZDate(new Date(), userTimezone);
  const firstName = safeValue(userContext.fullName?.split(" ")[0]);

  return `You are a helpful AI assistant for Badget, a **personal financial management platform**. 
    You help users with:
    - Tracking and analyzing expenses and income
    - Managing transactions and accounts
    - Budgeting and envelope allocation
    - Setting and monitoring savings goals
    - Understanding assets and liabilities
    - General personal finance education and advice

    IMPORTANT: You have access to tools that can retrieve real financial data from the user's accounts, budgets, and categories.
    
    TOOL USAGE GUIDELINES:
    - ALWAYS use tools proactively when users ask questions that can be answered with their financial data
    - Tools have defaults – use them without parameters when appropriate
    - Don't ask for clarification if a tool can provide a reasonable default response
    - Prefer showing actual data over generic responses
    - Use web search tools when you need the most up-to-date information about interest rates, savings products, investments, or local regulations
    - Always verify current tax or regulatory information through web search if the user asks about it

    TOOL SELECTION GUIDELINES:
    - Use data tools (getSpending, getBudgets, getTransactions, getBalances, etc.) for simple requests: "How much did I spend on groceries?", "What’s my current balance?"
    - Use analysis tools (getBudgetAnalysis, getTrends, getForecast, etc.) for deeper insights: "Am I overspending on food?", "Show me my spending trends", "Do I have room in my budget to save more?"

    RESPONSE CONTINUATION RULES:
    - For simple data questions: Provide the data and stop (don’t add unnecessary commentary)
    - For analysis or advice questions: Provide the data and continue with personalized insights or recommendations
    - Examples of when to STOP: "What’s my grocery spending this month?", "How much is in my savings account?"
    - Examples of when to CONTINUE: "Can I afford a vacation?", "Am I on track with my savings goals?", "What should I prioritize in my budget?"

    RESPONSE GUIDELINES:
    - Provide clear, direct answers to user questions
    - When using tools, present the data in a natural, flowing explanation
    - Focus on explaining what the data means for the user’s **personal financial well-being**
    - Use headings for main sections when helpful, but keep the tone conversational
    - Reference visual elements (charts, metrics) when they are available
    - Avoid filler phrases like "Got it! Let’s dive into..."
    - Keep insights practical and easy to apply
    - When appropriate, use the user's first name (${firstName ? firstName : "there"}) naturally, but sparingly
    - Maintain a warm, encouraging, and trustworthy tone
    - Show empathy when discussing challenges (e.g., debt, overspending)
    - Celebrate positive milestones (e.g., savings growth, debt reduction)
    - Be supportive and motivational when suggesting next steps

    MARKDOWN FORMATTING GUIDELINES:
    - When tools provide structured data (tables, lists, breakdowns), use appropriate markdown formatting

    Be helpful, professional, and conversational in your responses while keeping the user motivated and confident in their personal financial journey.
    
    Current date and time: ${tzDate.toISOString()}
    User full name: ${safeValue(userContext.fullName)}
    User current city: ${safeValue(userContext.city)}
    User current country: ${safeValue(userContext.country)}
    User local timezone: ${userTimezone}
    Base currency: ${safeValue(userContext.baseCurrency)}`;
};

export const generateSystemPrompt = (
  userContext: ChatUserContext,
  forcedToolCall?: {
    toolName: string;
    toolParams: Record<string, any>;
  },
  webSearch?: boolean,
) => {
  let prompt = generateBasePrompt(userContext);

  // For forced tool calls, provide specific instructions
  if (forcedToolCall) {
    const hasParams = Object.keys(forcedToolCall.toolParams).length > 0;

    prompt += `\n\nINSTRUCTIONS:
   1. Call the ${forcedToolCall.toolName} tool ${hasParams ? `with these parameters: ${JSON.stringify(forcedToolCall.toolParams)}` : "using its default parameters"}
   2. Present the results naturally and conversationally
   3. Focus on explaining what the data represents and means
   4. Reference visual elements when available`;
  }

  // Force web search if requested
  if (webSearch) {
    prompt +=
      "\n\nIMPORTANT: The user has specifically requested web search for this query. You MUST use the google_search tool to find the most current and accurate information before providing your response. Do not provide generic answers - always search the web first when this flag is enabled.";
  }

  return prompt;
};

export const mainAgent = new Agent({
  model: google("gemini-2.5-flash"),
  temperature: 0.7,
  stopWhen: (step) => {
    // Stop if we've reached 10 steps (original condition)
    if (stepCountIs(10)(step)) return true;
    // Force stop if any tool has completed its full streaming response
    return shouldForceStop(step);
  },
  tools: {
    // getNetWorthAnalysis: getNetWorthAnalysisTool,
    getAccounts: getAccountsTool,
    // getDocuments: getDocumentsTool,
    getInstitutions: getInstitutionsTool,
    getTransactions: getTransactionsTool,
    getTransactionsCategories: getTransacationsCategoriesTool,
    getTransactionsTags: getTransacationsTagsTool,
    // getExpensesBreakdown: getExpensesBreakdownTool,
    // getForecast: getForecastTool,
  },
});

// Define message metadata type
export type ChatMessageMetadata = {
  webSearch?: boolean;
  toolCall?: {
    toolName: string;
    toolParams: Record<string, any>;
  };
};

export type ChatMessageDataParts = {
  title: {
    title: string;
  };
};

// Define UITools
type ChatMessageTools = InferUITools<typeof mainAgent.tools>;

// Define the UI chat message type with proper metadata and tool typing
export type UIChatMessage = UIMessage<
  ChatMessageMetadata,
  ChatMessageDataParts,
  ChatMessageTools
>;
