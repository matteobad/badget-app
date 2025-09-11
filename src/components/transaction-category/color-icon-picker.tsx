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
import {
  getCategoryColors,
  getColorFromName,
  getRandomColor,
} from "~/shared/helpers/categories";
import { DynamicIcon } from "lucide-react/dynamic";

import { Input } from "../ui/input";

type InputColorIconProps = {
  placeholder: string;
  defaultValue?: string;
  defaultColor?: string;
  defaultIcon?: IconName;
  autoFocus?: boolean;
  onChange: (values: { name: string; color: string; icon: IconName }) => void;
};

export function InputColorIcon({
  placeholder,
  defaultValue,
  onChange,
  defaultColor,
  defaultIcon,
  autoFocus,
}: InputColorIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState(defaultColor ?? getRandomColor());
  const [icon, setIcon] = useState(defaultIcon ?? "circle-dashed");
  const [value, setValue] = useState(defaultValue);

  // Combine default and custom options
  const allColors = [...DEFAULT_COLORS];
  const allIcons = [...DEFAULT_ICONS];

  const {
    backgroundColor,
    borderColor,
    color: textColor,
  } = getCategoryColors(color ?? undefined);

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="size-10 rounded-full border-2 p-0 hover:[&>svg]:scale-105"
            style={{ backgroundColor, color: textColor, borderColor }}
          >
            <DynamicIcon name={icon} className="size-4 transition-transform" />
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
                    onClick={() => {
                      setColor(color.value);
                      onChange({
                        name: value ?? "",
                        color: color.value,
                        icon: icon,
                      });
                    }}
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
                      icon === iconData.name
                        ? "border-gray-900 bg-gray-100"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                    onClick={() => {
                      setIcon(iconData.name);
                      onChange({
                        name: value ?? "",
                        color: color,
                        icon: iconData.name,
                      });
                    }}
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
      <Input
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="none"
        autoFocus={autoFocus}
        autoCorrect="off"
        spellCheck="false"
        className="pl-7"
        value={value}
        onChange={(evt) => {
          const newName = evt.target.value;
          const newColor = getColorFromName(newName);
          const newIcon = icon; // TODO: getColorFromIcon(newName);

          setValue(newName);
          setColor(newColor);
          setIcon(newIcon);

          if (newColor) {
            onChange({
              name: newName,
              color: newColor,
              icon: newIcon,
            });
          }
        }}
      />
    </div>
  );
}
