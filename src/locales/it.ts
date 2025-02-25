export default {
  hello: "Ciao",
  "hello.world": "Ciao mondo!",
  welcome: "Benvenuto {name}!",

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
      linked: "Connesso",
      pending: "In corso",
      expired: "Scaduto",
      unknown: "Non connesso",
    },
  },
} as const;
