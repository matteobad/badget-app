export default {
  hello: "Hello",
  "hello.world": "Hello world!",
  welcome: "Hello {name}!",

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
      linked: "Connected",
      pending: "Ongoing",
      expired: "Expired",
      unknown: "Disconnected",
    },
  },
} as const;
