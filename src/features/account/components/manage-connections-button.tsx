"use client";

import { LinkIcon } from "lucide-react";
import { useQueryStates } from "nuqs";

import { Button } from "~/components/ui/button";
import { actionsParsers } from "~/utils/search-params";

export function ManageConnectionsButton() {
  const [, setState] = useQueryStates(actionsParsers, { shallow: false });

  return (
    <Button
      variant="outline"
      onClick={() => void setState({ action: "manage-connection" })}
    >
      <LinkIcon className="size-4" />
      Gestisci connessioni
    </Button>
  );
}
