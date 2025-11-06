import * as accounts from "./accounts";
import * as auth from "./auth";
import * as chats from "./chats";
import * as documents from "./documents";
import * as notifications from "./notifications";
import * as openBanking from "./open-banking";
import * as transactions from "./transactions";

export const schema = {
  ...auth,
  ...accounts,
  ...chats,
  ...documents,
  ...openBanking,
  ...transactions,
  ...notifications,
};
