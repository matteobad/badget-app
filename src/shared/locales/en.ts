export default {
  hello: "Hello",
  "hello.world": "Hello world!",
  welcome: "Hello {name}!",

  auth: {
    signin_title: "Welcome to Badget.",
    signin_subtitle: "New here or coming back? Choose how you want to continue",
    no_account: "Don't have an account yet?",
  },

  charts: {
    stacked_bar_chart: {
      total: "Total",
      total_expense: "Total expenses",
      recurring: "Recurring",
    },
  },

  chart_type: {
    net_worth: "Net Worth",
    expense: "Expenses",
  },

  spending_period: {
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
    actions: {
      add: "Add account",
      connect: "Connect account",
      create: "Create manually",
      recalculate: "Refresh balances",
    },
    metrics: {
      net_worth: {
        title: "Patrimonio netto",
        description:
          "Net worth is the total value of all your assets minus your liabilities.",
        info: "All amounts are shown in your base currency",
      },
      asset: {
        title: "Assets",
        description: "Total value of what you own",
        info: "Assets include cash, investments, property, and other valuables you possess.",
      },
      liability: {
        title: "Liabilities",
        description: "Total value of what you owe",
        info: "Liabilities include debts, loans, credit cards, and other financial obligations.",
      },
      "account#one": "{count} account",
      "account#other": "{count} accounts",
    },
    type: {
      asset: "Asset",
      liability: "Liability",
    },
    subtype: {
      cash: "Cash",
      "checking#one": "Checking account",
      "checking#other": "Checking accounts",
      "savings#one": "Saving account",
      "savings#other": "Saving accounts",
      investment: "",
      property: "",
      credit_card: "",
      loan: "",
      mortgage: "",
      other_liability: "",
    },
  },

  connection: {
    status: {
      connected: "Connected",
      disconnected: "Expired",
      unknown: "Disconnected",
    },
  },

  bank_account: {
    actions: {
      view_details: "View details",
      create_category: "Create account",
      delete_category: "Delete",
    },
  },

  category: {
    budget: "Accrual-based budget",
    labels: {
      classification: "Classificazione",
      name: "Nome categoria",
      parent: "Categoria padre (opzionale)",
    },
    placeholders: {
      type: "Uscite",
      name: "Shopping",
      parent: "Seleziona categoria...",
    },
    actions: {
      view_details: "View details",
      create_category: "Create category",
      create_subcategory: "Create subcategory",
      delete_category: "Delete",
    },
    type: {
      income: "Income",
      expense: "Expense",
      transfer: "Transfer",
    },
  },

  categories: "You have {count} categories",
  "categories.budget.warning#zero": "There are no problem with your budget",
  "categories.budget.warning#one": "We found one problem with your budget",
  "categories.budget.warning#other":
    "We found {count} problems with your budget",
  "categories.budget.warning.node": "Budget below total children",

  transaction: {
    tags: "Tags",
    attachments: "Attachments",
    general: "General",
    notes: "Notes",
    "similar#one":
      "We found {count} similar transaction. Should we mark it too?",
    "similar#other":
      "We found {count} similar transactions. Should we mark them too?",
    exclude_label: "Exclude from analytics",
    exclude_description:
      "Exclude this transaction from analytics like profit, expense and revenue. This is useful for internal transfers between accounts to avoid double-counting.",
    recurring_label: "Mark as recurring",
    recurring_description:
      "Mark as recurring. Similar future transactions will be automatically categorized and flagged as recurring.",
    frequency: {
      weekly: "Weekly",
      biweekly: "Biweekly",
      monthly: "Monthly",
      semi_monthly: "Semi monthly",
      annually: "Annualy",
      irregular: "Irregular",
      unknown: "None",
    },

    action_bar: {
      "selected#one": "selected",
      "selected#other": "selected",
      deselect_tooltip: "Deselect all",
      categories_tooltip: "Manage categories",
      tags_tooltip: "Manage tags",
      recurring_tooltip: "Manage recurrence",
      delete_tooltip: "Delete all",
      cannot_delete_tooltip: "You can only delete manual transactions",
      export_label: "Export",
    },
  },

  bottom_bar: {
    "transactions#one": "1 Transaction",
    "transactions#other": "{count} Transactions",
    multi_currency: "Multi currency",
    description: "Includes transactions from all pages of results",
  },
} as const;
