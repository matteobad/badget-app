import React from "react";
import { ACCOUNT_TYPE } from "~/shared/constants/enum";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

type AccountTypeSelectProps = {
  onReset?: () => void;
};

export function AccountTypeSelect({
  ...props
}: React.ComponentPropsWithoutRef<typeof Select> & AccountTypeSelectProps) {
  return (
    <Select {...props}>
      <SelectTrigger className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 [&>span_svg]:text-muted-foreground/80">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
        {Object.values(ACCOUNT_TYPE).map((type) => {
          return (
            <SelectItem value={type} key={type}>
              <span className="truncate">{type}</span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
