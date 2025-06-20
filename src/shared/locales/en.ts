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

  "categories.budget.warning#zero": "There are no problem with your budget",
  "categories.budget.warning#one": "We found one problem with your budget",
  "categories.budget.warning#other":
    "We found {count} problems with your budget",
  "categories.budget.node.warning": "{excess} below total children budget",
} as const;
