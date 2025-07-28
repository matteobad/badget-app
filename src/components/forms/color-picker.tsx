import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { HexColorPicker } from "react-colorful";

import { Button } from "../ui/button";

type Props = {
  value: string;
  onSelect: (value: string) => void;
  className: string;
};

export function ColorPicker({ value, onSelect, className }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          type="button"
          className={cn("transition-colors", className)}
          style={{
            backgroundColor: value,
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" sideOffset={14}>
        <HexColorPicker
          className="color-picker"
          color={value}
          onChange={(c) => {
            onSelect(c);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
