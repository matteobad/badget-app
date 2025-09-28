// Tool metadata for title generation and UI display
export const toolMetadata = {
  getBurnRateAnalysis: {
    name: "getBurnRateAnalysis",
    title: "Burn Rate Analysis",
    description:
      "Generate comprehensive burn rate analysis with interactive visualizations, spending trends, runway projections, and actionable insights",
    relatedTools: ["getBurnRate", "getTransactions", "getExpenses"],
  },
  getBurnRate: {
    name: "getBurnRate",
    title: "Burn Rate",
    description:
      "Calculate and analyze monthly cash burn rate, showing how much money the business spends each month",
    relatedTools: ["getBurnRateAnalysis", "getTransactions"],
  },
  getTransactions: {
    name: "getTransactions",
    title: "Transactions",
    description:
      "Retrieve and analyze financial transactions with advanced filtering, search, and sorting capabilities",
    relatedTools: [
      /*"getBurnRate", "getBurnRateAnalysis", "getExpenses"*/
    ],
  },
  getIncome: {
    name: "getIncome",
    title: "Income",
    description:
      "Retrieve and analyze income over a given period, highlighting total income, main sources, and trends. Use this tool when users ask about salary, revenue, or other income streams.",
    relatedTools: ["getTransactions"],
  },
  getBalances: {
    name: "getBalances",
    title: "Balances",
    description:
      "Retrieve current account balances, including breakdown by account and total net balance. Use this tool when users ask about available cash, bank account status, or liquidity.",
    relatedTools: ["getTransactions"],
  },
  getExpensesBreakdown: {
    name: "getExpensesBreakdown",
    title: "Expenses Breakdown",
    description:
      "Retrieve and analyze financial expenses with advanced filtering, search, and sorting capabilities",
    relatedTools: ["getTransactions"],
  },
  getForecast: {
    name: "getForecast",
    title: "Forecast",
    description:
      "Retrieve and analyze financial forecast with advanced filtering, search, and sorting capabilities",
    relatedTools: ["getTransactions"],
  },
} as const;

export type ToolName = keyof typeof toolMetadata;

export type MessageDataParts = {
  title: {
    title: string;
  };
};
