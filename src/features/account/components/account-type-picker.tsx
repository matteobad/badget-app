import React from "react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ACCOUNT_TYPE } from "~/server/db/schema/enum";
import { useScopedI18n } from "~/shared/locales/client";

import AccountIcon from "./account-icon";

type AccountTypePickerProps = {
  onReset?: () => void;
};

export function AccountTypePicker({
  onReset,
  ...props
}: React.ComponentPropsWithoutRef<typeof Select> & AccountTypePickerProps) {
  const tScoped = useScopedI18n("account.type");

  return (
    <Select {...props} value={props.value ?? ""}>
      <SelectTrigger className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 [&>span_svg]:text-muted-foreground/80">
        <SelectValue placeholder="Seleziona una tipologia"></SelectValue>
      </SelectTrigger>
      <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
        <SelectGroup>
          {Object.values(ACCOUNT_TYPE).map((option) => {
            return (
              <SelectItem value={option} key={option}>
                <AccountIcon type={option} size="sm" />
                {tScoped(option)}
              </SelectItem>
            );
          })}
        </SelectGroup>
        {props.value && onReset && (
          <SelectGroup>
            <SelectSeparator />
            <Button
              className="w-full px-2"
              variant="secondary"
              size="sm"
              onClick={onReset}
            >
              Pulisci selezione
            </Button>
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
