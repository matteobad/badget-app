"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Theme = "dark" | "system" | "light";

type Props = {
  currentTheme?: Theme;
};

const ThemeIcon = ({ currentTheme }: Props) => {
  switch (currentTheme) {
    case "dark":
      return <Moon size={12} />;
    case "system":
      return <Monitor size={12} />;
    default:
      return <Sun size={12} />;
  }
};

export const ThemeSelect = () => {
  const { theme, setTheme, themes, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-[32px]" />;
  }

  return (
    <div className="relative flex items-center">
      <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
        <SelectTrigger className="h-[32px] w-full bg-transparent py-1.5 pr-3 pl-8 text-xs capitalize outline-none">
          <SelectValue>
            {theme
              ? theme.charAt(0).toUpperCase() + theme.slice(1)
              : "Select theme"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {themes.map((theme) => (
              <SelectItem key={theme} value={theme} className="capitalize">
                {theme}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="pointer-events-none absolute left-3">
        <ThemeIcon currentTheme={resolvedTheme as Theme} />
      </div>
    </div>
  );
};
