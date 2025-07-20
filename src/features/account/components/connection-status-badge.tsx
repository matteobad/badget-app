"use client";

import type { ConnectionStatusType } from "~/server/db/schema/enum";
import { Badge } from "~/components/ui/badge";
import { CONNECTION_STATUS } from "~/server/db/schema/enum";
import { useScopedI18n } from "~/shared/locales/client";

export default function ConnectionStatusBadge({
  status,
}: {
  status: ConnectionStatusType;
}) {
  const tScoped = useScopedI18n("connection.status");
  const label = tScoped(status);

  return (
    <>
      {status === CONNECTION_STATUS.CONNECTED && (
        <Badge className="bg-green-700 text-primary-foreground [a&]:hover:bg-green-700/90">
          {label}
        </Badge>
      )}
      {status === CONNECTION_STATUS.DISCONNECTED && (
        <Badge variant="destructive">{label}</Badge>
      )}
      {status === CONNECTION_STATUS.UNKNOWN && (
        <Badge variant="outline">{label}</Badge>
      )}
    </>
  );
}
