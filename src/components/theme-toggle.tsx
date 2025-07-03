"use client";

import * as React from "react";
import { Button } from "~/components/ui/button";
import { ComputerIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function ThemeToggle(props: {
  align?: "center" | "start" | "end";
  side?: "top" | "bottom";
}) {
  const { setTheme, theme } = useTheme();

  const triggerIcon = {
    light: <Sun className="h-6 w-6" />,
    dark: <Moon className="h-6 w-6" />,
    system: <ComputerIcon className="h-6 w-6" />,
  }[theme as "light" | "dark" | "system"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 px-2 text-lg font-semibold md:text-base"
        >
          {triggerIcon}
          <span className="capitalize">{theme}</span>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={props.align} side={props.side}>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <ComputerIcon className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
