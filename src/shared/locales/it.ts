export default {
  hello: "Ciao",
  "hello.world": "Ciao mondo!",
  welcome: "Benvenuto {name}!",

  chart_type: {
    net_worth: "Patrimonio Netto",
    expense: "Uscite",
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
    income: "Entrate",
    expense: "Uscite",
  },
  transaction_frequency: {
    weekly: "Weekly recurring",
    monthly: "Monthly recurring",
    annually: "Annually recurring",
  },

  registry: "Anagrafica",

  breadcrumb: {
    banking: "Liquidità",
    accounts: "Conti",
    investments: "Investimenti",
    settings: "Impostazioni",
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
      connected: "Connesso",
      disconnected: "Scaduto",
      unknown: "Non connesso",
    },
  },

  category: {
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
      view_details: "Vedi dettagli",
      create_category: "Crea categoria",
      create_subcategory: "Crea sottocategoria",
      delete_category: "Elimina",
    },
    type: {
      income: "Entrate",
      expense: "Uscite",
      transfer: "Trasferimenti",
    },
    budget: "Budget di competenza",
  },

  categories: "Hai {count} categorie",
  "categories.budget.warning#zero": "Non ci sono problemi col tuo budget",
  "categories.budget.warning#one": "Abbiamo notato un problema nel budget",
  "categories.budget.warning#other":
    "Abbiamo notato {count} problemi nel budget",
  "categories.budget.warning.node": "budget inferiore al totale dei figli",

  bank_account: {
    actions: {
      view_details: "Vedi dettagli",
      create_category: "Crea conto",
      delete_category: "Elimina",
    },
  },

  bottom_bar: {
    "transactions#one": "1 Transazione",
    "transactions#other": "{count} Transazioni",
    multi_currency: "Multi currency",
    description: "Include tutte le transazioni filtrate",
  },
} as const;
