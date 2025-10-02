import type { useI18n } from "~/shared/locales/client";
import { formatAmount } from "~/shared/helpers/format";
import { format } from "date-fns";

type UseI18nReturn = ReturnType<typeof useI18n>;

interface NotificationUser {
  locale?: string | null;
  dateFormat?: string | null;
}

interface NotificationMetadata {
  [key: string]: any;
}

type NotificationDescriptionHandler = (
  metadata: NotificationMetadata,
  user: NotificationUser | undefined,
  t: UseI18nReturn,
) => string;

const handleTransactionsCreated: NotificationDescriptionHandler = (
  metadata,
  user,
  t,
) => {
  const count = metadata?.count || metadata?.transactionCount || 1;
  const transaction = metadata?.transaction;

  // For single transactions, show rich details
  if (count === 1 && transaction) {
    const formattedAmount =
      formatAmount({
        currency: transaction.currency,
        amount: transaction.amount,
        locale: user?.locale || "it-IT",
      }) ?? `${transaction.amount} ${transaction.currency}`;

    const userDateFormat = user?.dateFormat || "dd/MM/yyyy";
    const formattedDate = format(new Date(transaction.date), userDateFormat);

    return t("notifications.transactions_created.single_transaction", {
      name: transaction.name,
      amount: formattedAmount,
      date: formattedDate,
    });
  }

  // For multiple transactions, use count-based messages
  if (count <= 5) {
    return t("notifications.transactions_created.title", { count });
  }
  return t("notifications.transactions_created.title_many", { count });
};

const notificationHandlers: Record<string, NotificationDescriptionHandler> = {
  transactions_created: handleTransactionsCreated,
};

export function getNotificationDescription(
  activityType: string,
  metadata: NotificationMetadata,
  user: NotificationUser | undefined,
  t: UseI18nReturn,
): string {
  const handler = notificationHandlers[activityType];
  if (handler) {
    return handler(metadata, user, t);
  }
  return t("notifications.default.title");
}
