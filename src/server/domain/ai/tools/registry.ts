// Tool metadata for title generation and UI display
export const toolMetadata = {
  getNetWorthAnalysis: {
    name: "getNetWorthAnalysis",
    title: "Net Worth Analysis",
    description:
      "Generate comprehensive net worth analysis with interactive visualizations, trends, assets, and liabilities insights",
    relatedTools: ["getNetWorth", "getTransactions"],
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
    relatedTools: ["getNetWorth", "getNetWorthAnalysis", "getExpenses"],
  },
  getExpensesBreakdown: {
    name: "getExpensesBreakdown",
    title: "Expenses Breakdown",
    description:
      "Generate an expenses breakdown with visualizations, category analysis, and insights on spending distribution",
    relatedTools: ["getTransactions"],
  },
  getForecast: {
    name: "getForecast",
    title: "Forecast",
    description:
      "Retrieve and analyze financial forecast with advanced filtering, search, and sorting capabilities",
    relatedTools: ["getNetWorth", "getNetWorthAnalysis", "getTransactions"],
  },
} as const;

export type ToolName = keyof typeof toolMetadata;

export type MessageDataParts = {
  title: {
    title: string;
  };
};
