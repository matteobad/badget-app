import type { LucideIcon } from "lucide-react";
import type { IconName } from "lucide-react/dynamic";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { DEFAULT_COLORS } from "~/shared/constants/colors";
import { DEFAULT_ICONS } from "~/shared/constants/icons";
import { getCategoryColors } from "~/shared/helpers/categories";
import { DynamicIcon } from "lucide-react/dynamic";

// Type definitions
type ColorOption = {
  name: string;
  value: string;
};

type IconOption = {
  name: IconName;
  icon: LucideIcon;
};

type ColorIconPickerProps = {
  selectedColor?: string | null;
  selectedIcon?: string | null;
  onColorChange?: (color: string) => void;
  onIconChange?: (iconName: string) => void;
  customColors?: ColorOption[];
  customIcons?: IconOption[];
  className?: string;
};

export function ColorIconPicker({
  selectedColor = DEFAULT_COLORS[0].value,
  selectedIcon = DEFAULT_ICONS[0].name,
  onColorChange,
  onIconChange,
  customColors = [],
  customIcons = [],
  className,
}: ColorIconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Combine default and custom options
  const allColors = [...DEFAULT_COLORS, ...customColors];
  const allIcons = [...DEFAULT_ICONS, ...customIcons];

  // Find selected icon component
  const selectedIconData = allIcons.find((icon) => icon.name === selectedIcon);
  const selectedIconName = selectedIconData?.name ?? DEFAULT_ICONS[0].name;

  const handleColorSelect = (color: string) => {
    onColorChange?.(color);
  };

  const handleIconSelect = (iconName: string) => {
    onIconChange?.(iconName);
  };

  const { backgroundColor, borderColor, color } = getCategoryColors(
    selectedColor ?? undefined,
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "size-10 rounded-full border-2 p-0 hover:[&>svg]:scale-105",
            className,
          )}
          style={{ backgroundColor, color, borderColor }}
        >
          <DynamicIcon
            name={selectedIconName}
            className="size-4 transition-transform"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[328px] p-0" align="start">
        <div className="">
          {/* Colors Section */}
          <div className="grid grid-cols-8 gap-2 p-4">
            {allColors.map((color, index) => (
              <div
                key={index}
                className="flex size-8 items-center justify-center rounded-full border-2"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "size-6 rounded-full p-0 transition-all hover:scale-110",
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleColorSelect(color.value)}
                  title={color.name}
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Icons Section */}
          <div className="grid max-h-[224px] grid-cols-8 gap-2 overflow-y-auto p-4">
            {allIcons.map((iconData) => {
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
                  onClick={() => handleIconSelect(iconData.name)}
                  title={iconData.name}
                >
                  <DynamicIcon name={iconData.name} className="size-4" />
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
