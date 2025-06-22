import type { IconKey } from "~/shared/constants/icons";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { AVAILABLE_ICONS } from "~/shared/constants/icons";

interface IconPickerProps {
  value: IconKey;
  onChange: (icon: IconKey) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const SelectedIcon = AVAILABLE_ICONS[value].component;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="size-4 p-0 transition-transform hover:scale-105 hover:bg-transparent"
          aria-label={`Selected icon: ${AVAILABLE_ICONS[value].name}`}
        >
          <SelectedIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mt-2 -ml-12 w-94 p-4" align="start">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Choose an icon</h4>
          <ScrollArea className="h-58">
            <div className="grid grid-cols-7 gap-2 pr-4">
              {Object.entries(AVAILABLE_ICONS).map(([key, icon]) => {
                const IconComponent = icon.component;
                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-10 w-10 p-0 transition-all hover:bg-muted",
                      value === key &&
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                    onClick={() => onChange(key as IconKey)}
                    aria-label={icon.name}
                    title={icon.name}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
