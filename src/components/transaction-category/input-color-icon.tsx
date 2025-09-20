import type { CategoryMode } from "~/hooks/use-category-form";
import type { IconName } from "lucide-react/dynamic";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useCategoryForm } from "~/hooks/use-category-form";
import { cn } from "~/lib/utils";
import { getCategoryColors } from "~/shared/helpers/categories";
import { PlusIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { HexColorPicker } from "react-colorful";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type InputColorIconProps = {
  mode: CategoryMode;
  parentColor?: any;
  defaultName?: string;
  defaultColor: string;
  defaultCustomColor: string;
  defaultIcon: IconName;
  autoFocus?: boolean;
  onChange: (values: { name: string; color: string; icon: IconName }) => void;
};

export function InputColorIcon({
  mode,
  parentColor,
  defaultName,
  defaultIcon,
  defaultColor,
  defaultCustomColor,
  onChange,
  autoFocus,
}: InputColorIconProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(defaultName ?? "");
  const [suggestion, setSuggestion] = useState(mode === "create");

  const {
    icons,
    colorOptions,
    selectedIcon,
    setSelectedIcon,
    selectedColor,
    setSelectedColor,
    customColor,
    setCustomColor,
  } = useCategoryForm({
    mode,
    parentColor,
    name,
    defaultIcon,
    defaultColor,
    defaultCustomColor,
    suggestion,
  });

  // console.log({ selectedColor, selectedIcon });

  const {
    backgroundColor,
    borderColor,
    color: textColor,
  } = getCategoryColors(selectedColor ?? undefined);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <div className="relative">
          <div
            className="absolute top-0 left-0 flex size-9 items-center justify-center border-r p-0 hover:[&>svg]:scale-105"
            style={{ backgroundColor, color: textColor, borderColor }}
          >
            <DynamicIcon
              name={selectedIcon as IconName}
              className="size-4 transition-transform"
            />
          </div>
          <Input
            ref={inputRef}
            placeholder="Ex. Groceries"
            autoComplete="off"
            autoCapitalize="none"
            autoFocus={autoFocus}
            autoCorrect="off"
            spellCheck="false"
            className="pl-11"
            value={name}
            onChange={(evt) => {
              const newName = evt.target.value;
              setName(newName);
              onChange({
                name: newName,
                color: selectedColor,
                icon: selectedIcon as IconName,
              });
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[220px] p-0"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="">
          {/* Colors Section */}
          <div className="grid grid-cols-8 gap-2 p-2">
            {colorOptions.map((color, index) => (
              <div
                key={index}
                className="flex size-5 items-center justify-center border"
              >
                <Button
                  variant="ghost"
                  className={cn("size-4 p-0 transition-all hover:scale-110")}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSuggestion(false); // If user choose a color disable suggestions
                    setSelectedColor(color);
                    onChange({
                      name,
                      color,
                      icon: selectedIcon as IconName,
                    });
                  }}
                />
              </div>
            ))}
            <HoverCard>
              <HoverCardTrigger className="flex size-5 items-center justify-center border p-0 [&>svg]:hidden">
                <PlusIcon className="block! size-3 shrink-0" />
              </HoverCardTrigger>
              <HoverCardContent
                side="right"
                align="start"
                sideOffset={10}
                alignOffset={-9}
                className="w-fit p-0"
              >
                <HexColorPicker
                  color={customColor ?? undefined}
                  onChange={(color) => {
                    setSuggestion(false); // If user choose a color disable suggestions
                    setCustomColor(color);
                    onChange({
                      name,
                      color,
                      icon: selectedIcon as IconName,
                    });
                  }}
                />
              </HoverCardContent>
            </HoverCard>
          </div>

          <Separator />

          {/* Icons Section */}
          <div className="flex flex-col gap-2 p-2">
            <div className="grid max-h-[140px] grid-cols-6 gap-1 overflow-y-auto">
              {icons.map((iconData) => {
                return (
                  <Button
                    key={iconData.name}
                    variant="ghost"
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg transition-all",
                      selectedIcon === iconData.name
                        ? "border-gray-900 bg-gray-100"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                    onClick={() => {
                      setSuggestion(false); // If user choose an icon disable suggestions
                      setSelectedIcon(iconData.name);
                      onChange({
                        name,
                        color: selectedColor,
                        icon: iconData.name as IconName,
                      });
                    }}
                    title={iconData.name}
                  >
                    <DynamicIcon
                      name={iconData.name as IconName}
                      className="size-4"
                    />
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
