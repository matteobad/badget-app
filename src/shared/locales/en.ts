export default {
  hello: "Hello",
  "hello.world": "Hello world!",
  welcome: "Hello {name}!",

  chart_type: {
    net_worth: "Net Worth",
    expense: "Expenses",
  },

  spending_period: {
    last_30d: "Last 30 days",
    this_month: "This month",
    last_month: "Last month",
    this_year: "This year",
    last_year: "Last year",
  },
  transactions_period: {
    all: "All",
    income: "Income",
    expense: "Expense",
  },
  transaction_frequency: {
    weekly: "Weekly recurring",
    monthly: "Monthly recurring",
    annually: "Annually recurring",
  },

  registry: "Registry",

  breadcrumb: {
    banking: "Banking",
    accounts: "Accounts",
    investments: "Investments",
    settings: "Settings",
  },

  account: {
    type: {
      checking: "Conto corrente",
      savings: "Conto deposito",
      investment: "Conto titoli",
      debt: "Conto di debito",
      cash: "Liquidi",
      other: "Altro",
    },
  },

  connection: {
    status: {
      connected: "Connected",
      disconnected: "Expired",
      unknown: "Disconnected",
    },
  },

  category: {
    budget: "Accrual-based budget",
    actions: {
      view_details: "View details",
      create_subcategory: "Create subcategory",
      delete_category: "Delete",
    },
  },

  categories: "You have {count} categories",
  "categories.budget.warning#zero": "There are no problem with your budget",
  "categories.budget.warning#one": "We found one problem with your budget",
  "categories.budget.warning#other":
    "We found {count} problems with your budget",
  "categories.budget.warning.node": "Budget below total children",

  bottom_bar: {
    "transactions#one": "1 Transaction",
    "transactions#other": "{count} Transactions",
    multi_currency: "Multi currency",
    description: "Includes transactions from all pages of results",
  },
} as const;
