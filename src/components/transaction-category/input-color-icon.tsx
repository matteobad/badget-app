import type { CategoryMode } from "~/hooks/use-category-form";
import type { IconName } from "lucide-react/dynamic";
import { useState } from "react";
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
  parentColor?: string;
  defaultName?: string;
  defaultColor: string;
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
  onChange,
  autoFocus,
}: InputColorIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(defaultName ?? "");
  const [suggestion, setSuggestion] = useState(mode !== "edit");

  const {
    icons,
    colorOptions,
    selectedIcon,
    setSelectedIcon,
    selectedColor,
    setSelectedColor,
  } = useCategoryForm({
    mode,
    parentColor,
    name,
    defaultIcon,
    defaultColor,
    suggestion,
  });

  const {
    backgroundColor,
    borderColor,
    color: textColor,
  } = getCategoryColors(selectedColor ?? undefined);

  return (
    <div
      className="relative"
      style={{ backgroundColor, color: textColor, borderColor }}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger className="absolute top-0 left-0 flex size-9 items-center justify-center p-0">
          <DynamicIcon
            name={selectedIcon as IconName}
            className="size-4 transition-transform"
          />
        </PopoverTrigger>
        <PopoverContent
          className="w-[220px] p-0"
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="">
            {/* Colors Section */}
            <div className="grid grid-cols-6 items-center justify-center gap-4 p-4">
              {colorOptions.map((color, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  d
                  className={cn("size-4 p-0 outline-offset-2", {
                    "!outline-2": color === selectedColor,
                    "hover:scale-110": color !== selectedColor,
                  })}
                  style={{
                    backgroundColor: color,
                    outlineColor: color,
                    // @ts-expect-error override tw-variable
                    "--tw-outline-style": "solid",
                  }}
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
              ))}
              <HoverCard openDelay={0}>
                <HoverCardTrigger className="flex size-4 items-center justify-center border border-muted-foreground p-0 [&>svg]:hidden">
                  <PlusIcon className="block! size-3 shrink-0 text-muted-foreground" />
                </HoverCardTrigger>
                <HoverCardContent
                  side="right"
                  align="start"
                  sideOffset={22}
                  alignOffset={-49}
                  className="w-fit p-0"
                >
                  <HexColorPicker
                    color={selectedColor}
                    onChange={(color) => {
                      setSuggestion(false); // If user choose a color disable suggestions
                      setSelectedColor(color);
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
      <Input
        style={{ borderColor }}
        autoComplete="off"
        autoCapitalize="none"
        autoFocus={autoFocus}
        autoCorrect="off"
        spellCheck="false"
        className="pl-[34px]"
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
  );
}
