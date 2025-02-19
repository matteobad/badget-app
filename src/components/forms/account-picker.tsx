import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type AccountPickerProps = {
  options: {
    id: string;
    logoUrl: string | null;
    name: string;
  }[];
};

export function AccountPicker({
  options,
  defaultValue,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  onValueChange,
}: React.ComponentPropsWithoutRef<typeof Select> & AccountPickerProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 [&>span_svg]:text-muted-foreground/80">
        <SelectValue placeholder="Seleziona..." />
      </SelectTrigger>
      <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
        {options.map((option) => {
          return (
            <SelectItem value={option.id} key={option.id}>
              <Avatar className="size-4">
                <AvatarImage
                  src={option.logoUrl!}
                  alt={`${option.name} logo`}
                ></AvatarImage>
                <AvatarFallback>AN</AvatarFallback>
              </Avatar>
              {option.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
