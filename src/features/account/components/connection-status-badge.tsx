"use client";

import type { ConnectionStatusType } from "~/server/db/schema/enum";
import { Badge } from "~/components/ui/badge";
import { useScopedI18n } from "~/locales/client";
import { CONNECTION_STATUS } from "~/server/db/schema/enum";

export default function ConnectionStatusBadge({
  status,
}: {
  status: ConnectionStatusType;
}) {
  const tScoped = useScopedI18n("connection.status");
  const label = tScoped(status);

  return (
    <>
      {status === CONNECTION_STATUS.PENDING && (
        <Badge variant="secondary">{label}</Badge>
      )}
      {status === CONNECTION_STATUS.LINKED && (
        <Badge className="bg-green-700 text-primary-foreground [a&]:hover:bg-green-700/90">
          {label}
        </Badge>
      )}
      {status === CONNECTION_STATUS.EXPIRED && (
        <Badge variant="destructive">{label}</Badge>
      )}
      {status === CONNECTION_STATUS.UNKNOWN && (
        <Badge variant="outline">{label}</Badge>
      )}
    </>
  );
}
