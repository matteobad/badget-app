import type { ColorKey } from "~/shared/constants/colors";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { AVAILABLE_COLORS } from "~/shared/constants/colors";

interface ColorPickerProps {
  value: ColorKey;
  onChange: (color: ColorKey) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const selectedColor = AVAILABLE_COLORS[value];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="size-4 rounded-full border-2 p-0 transition-transform hover:scale-105"
          style={{ backgroundColor: selectedColor.hex }}
          aria-label={`Selected color: ${selectedColor.name}`}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Choose a color</h4>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(AVAILABLE_COLORS).map(([key, color]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 w-8 rounded-full border-2 p-0 transition-all hover:scale-110",
                  value === key && "ring-2 ring-primary ring-offset-2",
                )}
                style={{ backgroundColor: color.hex }}
                onClick={() => onChange(key as ColorKey)}
                aria-label={color.name}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
