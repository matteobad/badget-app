export default {
  hello: "Ciao",
  "hello.world": "Ciao mondo!",
  welcome: "Benvenuto {name}!",

  language: {
    title: "Languages",
    description: "Change the language used in the user interface.",
    placeholder: "Select language",
  },
  locale: {
    title: "Locale",
    searchPlaceholder: "Search locale",
    description:
      "Sets the region and language preferences for currency, dates, and other locale-specific formats.",
    placeholder: "Select locale",
  },
  languages: {
    en: "English",
    sv: "Swedish",
  },
  timezone: {
    title: "Time Zone",
    searchPlaceholder: "Search timezone",
    description:
      "Defines the default time zone used for displaying times in the app.",
    placeholder: "Select timezone",
  },

  widgets: {
    header: {
      subtitle: "ecco una rapida panoramica di come stanno andando le cose.",
      customize: "Personalizza",
      save: "Salva",
    },
    "net-worth": {
      title: "Patrimonio netto",
      description: {
        part_1: "Il tuo",
        part_2: "patrimonio netto è {value}",
      },
      action: "Vedi andamento",
      settings: {
        "1M": "1 Mese",
        "3M": "3 Mesi",
        "6M": "6 Mesi",
        "1Y": "1 Anno",
      },
    },
    income: {
      title: "Entrate questo mese",
      description: "Entrate",
      action: "Vedi andamenti entrate",
    },
    "monthly-spending": {
      title: "Spese mensili",
      description: "Spese questo mese",
      action: "Vedi spese più impattanti",
    },
    "category-expenses": {
      title: "Spese per categoria",
      action: "Vedi grafico dettagliato",
    },
    "recurring-tracker": {
      title: "Costi fissi",
      action: "Vedi dettaglio spese ricorrenti",
      content: {
        label: "Spese ricorrenti questo mese",
      },
    },
    "uncategorized-transactions": {
      title: "Transazioni non categorizzate",
      description: {
        part_1: "Hai ",
        part_2: "{count} transazioni non categorizzate ",
        part_3: " per un totale di ",
      },
      action: "Vedi tutte",
    },
    savings: {
      title: "Risparmi",
      description: {
        part_1: "Hai risparmiato ",
        part_2: "{value} in {count} mesi",
      },
      action: "Vedi analisi di dettaglio",
      settings: {
        "3M": "3 Mesi",
        "6M": "6 Mesi",
        "1Y": "1 Anno",
      },
    },
  },

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
    actions: {
      add: "Aggiungi account",
      connect: "Collega un conto",
      create: "Crea manualmente",
      recalculate: "Aggiorna saldi",
    },
    metrics: {
      net_worth: {
        title: "Patrimonio netto",
        description:
          "Il patrimonio netto è il valore totale di tutti i tuoi asset meno le tue passività.",
        info: "Tutti gli importi sono mostrati nella tua valuta base",
      },
      asset: {
        title: "Attività",
        description: "Valore totale delle tue attività finanziarie",
        info: "Le attività includono conti correnti, risparmi e altri asset di valore.",
      },
      liability: {
        title: "Passività",
        description: "Valore totale delle tue passività finanziarie",
        info: "Le passività includono debiti, mutui e altri obblighi finanziari.",
      },
      "account#one": "{count} account",
      "account#other": "{count} account",
    },
    type: {
      asset: "Attività",
      liability: "Passività",
    },
    subtype: {
      cash: "Contanti",
      checking: "Conto corrente",
      savings: "Conto deposito",
      investment: "Investimenti",
      property: "Proprietà",
      credit_card: "Carta di credito",
      loan: "Prestito",
      mortgage: "Mutuo",
      other_liability: "Altra passività",
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
      view_transactions: "Vedi transazioni",
      create_category: "Crea conto",
      edit_balance: "Aggiorna saldo",
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
      unknown: "Nessuna",
    },
    action_bar: {
      "selected#one": "selezionato",
      "selected#other": "selezionati",
      deselect_tooltip: "Deseleziona tutti",
      categories_tooltip: "Applica categoria",
      tags_tooltip: "Applica tag",
      recurring_tooltip: "Applica Ricorrenza",
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
