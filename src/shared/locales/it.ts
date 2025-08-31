export default {
  hello: "Ciao",
  "hello.world": "Ciao mondo!",
  welcome: "Benvenuto {name}!",

  auth: {
    signin_title: "Benvenuto in Badget.",
    signin_subtitle: "Nuovo qui o stai tornando? Scegli come vuoi continuare",
    no_account: "Non hai ancora un account?",
  },

  charts: {
    stacked_bar_chart: {
      total: "Totale",
      total_expense: "Totale uscite",
      recurring: "Ricorrenti",
    },
  },

  chart_type: {
    net_worth: "Patrimonio Netto",
    expense: "Uscite",
  },

  spending_period: {
    this_month: "Questo mese",
    last_month: "Mese scorso",
    this_year: "Anno corrente",
    last_year: "Anno passato",
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

  bank_account: {
    actions: {
      view_details: "Vedi dettagli",
      create_category: "Crea conto",
      delete_category: "Elimina",
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

  transaction: {
    tags: "Tags",
    attachments: "Allegati",
    general: "Generali",
    notes: "Note",
    "similar#one":
      "Abbiamo trovato {count} transazione simile. Vuoi categorizzarla allo stesso modo?",
    "similar#other":
      "Abbiamo trovato {count} transazioni simili. Vuoi categorizzarle allo stesso modo?",
    exclude_label: "Escludi dalle metriche",
    exclude_description:
      "Escludi questa transazione dalle analisi come profitti, spese e ricavi. Utile per i trasferimenti interni tra conti per evitare doppi conteggi.",
    recurring_label: "Segna come ricorrente",
    recurring_description:
      "Segna come ricorrente. Le future transazioni simili saranno automaticamente categorizzate e contrassegnate come ricorrenti.",
    frequency: {
      weekly: "Settimanale",
      biweekly: "Bi-settimanale",
      monthly: "Mensile",
      semi_monthly: "Semi mensile",
      annually: "Annuale",
      irregular: "Irregolare",
      unknown: "Sconosciuta",
    },
    action_bar: {
      "selected#one": "selezionato",
      "selected#other": "selezionati",
      deselect_tooltip: "Deseleziona tutti",
      categories_tooltip: "Applica categoria",
      tags_tooltip: "Applica tag",
      delete_tooltip: "Elimina tutte",
      cannot_delete_tooltip: "Puoi eliminare solo transazioni manuali",
      export_label: "Esporta",
    },
  },

  bottom_bar: {
    "transactions#one": "1 Transazione",
    "transactions#other": "{count} Transazioni",
    multi_currency: "Multi currency",
    description: "Include tutte le transazioni filtrate",
  },
} as const;
