import type { BaseColor } from "~/shared/constants/category";
import { useEffect, useState } from "react";
import {
  BASE_COLORS,
  buildColor,
  CATEGORY_ICONS,
  SHADES,
} from "~/shared/constants/category";

import { useCategorySuggestion } from "./use-category-suggestion";

export type CategoryMode = "create" | "create-sub" | "edit";

interface UseCategoryFormOptions {
  mode: CategoryMode;
  parentColor?: BaseColor;
  name?: string; // nome categoria
  defaultIcon: string;
  defaultColor: string; // tailwind class tipo "bg-blue-500"
  defaultCustomColor: string; // es. "#ff6600"
  suggestion: boolean;
}

export function useCategoryForm({
  mode,
  parentColor,
  name,
  defaultIcon,
  defaultColor,
  defaultCustomColor,
  suggestion,
}: UseCategoryFormOptions) {
  const [selectedIcon, setSelectedIcon] = useState(defaultIcon);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [customColor, setCustomColor] = useState(defaultCustomColor);

  const { suggest } = useCategorySuggestion();

  // solo in CREATE → suggerisco icona/colore
  useEffect(() => {
    if (!name || mode !== "create" || !suggestion) return;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const s = await suggest(name);
      if (s.icon) setSelectedIcon(s.icon);
      if (s.color) {
        setSelectedColor(buildColor(s.color, 1));
      }
    })();
  }, [name, mode, suggest, suggestion]);

  // palette da mostrare
  let colorOptions: string[] = [];

  if (mode === "create" || mode === "edit") {
    colorOptions = BASE_COLORS.map((base) => buildColor(base, 1));
  }

  if (mode === "create-sub" && parentColor) {
    colorOptions = SHADES.map((shade) => buildColor(parentColor, shade));
  }

  console.log({ suggest });
  console.log({ selectedIcon });
  console.log({ selectedColor });

  return {
    icons: CATEGORY_ICONS,
    colorOptions,
    selectedIcon,
    setSelectedIcon,
    selectedColor,
    setSelectedColor,
    customColor,
    setCustomColor,
  };
}
