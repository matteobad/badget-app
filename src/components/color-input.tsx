import { useState } from "react";
import { HexColorPicker } from "react-colorful";

import { getColorFromName, getRandomColor } from "~/lib/utils";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type ColorPickerProps = {
  value: string;
  onSelect: (value: string) => void;
};

export function ColorPicker({ value, onSelect }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="absolute top-3.5 left-3.5 size-3 rounded-[2px] transition-colors"
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

type ColorInputProps = {
  placeholder: string;
  defaultValue?: string;
  defaultColor?: string | null;
  autoFocus?: boolean;
  onChange: (values: { name: string; color: string }) => void;
};

export function InputColor({
  placeholder,
  defaultValue,
  onChange,
  defaultColor,
  autoFocus,
}: ColorInputProps) {
  const [color, setColor] = useState(defaultColor ?? getRandomColor());
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="relative flex items-center">
      <ColorPicker
        value={color}
        onSelect={(newColor) => {
          setColor(newColor);
          onChange({
            color: newColor,
            name: value ?? "",
          });
        }}
      />
      <Input
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="none"
        autoFocus={autoFocus}
        autoCorrect="off"
        spellCheck="false"
        className="rounded-l-none border-l-0 pl-10"
        value={value}
        onChange={(evt) => {
          const newName = evt.target.value;
          const newColor = getColorFromName(newName);

          setColor(newColor);
          setValue(newName);

          onChange({
            color: newColor,
            name: newName,
          });
        }}
      />
    </div>
  );
}
