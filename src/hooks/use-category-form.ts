import { useEffect, useState } from "react";
import { BASE_COLORS, CATEGORY_ICONS } from "~/shared/constants/category";

import { useCategorySuggestion } from "./use-category-suggestion";

export type CategoryMode = "create" | "create-sub" | "edit";

interface UseCategoryFormOptions {
  mode: CategoryMode;
  parentColor?: string;
  name?: string; // nome categoria
  defaultIcon: string;
  defaultColor: string; // tailwind class tipo "bg-blue-500"
  suggestion: boolean;
}

export function useCategoryForm({
  mode,
  parentColor,
  name,
  defaultIcon,
  defaultColor,
  suggestion,
}: UseCategoryFormOptions) {
  const [selectedIcon, setSelectedIcon] = useState(defaultIcon);
  const [selectedColor, setSelectedColor] = useState(defaultColor);

  const { suggest } = useCategorySuggestion();

  // solo in CREATE → suggerisco icona/colore
  useEffect(() => {
    if (!name || mode === "edit" || !suggestion) return;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const s = await suggest(name);
      if (s.icon) setSelectedIcon(s.icon);
      if (s.color) setSelectedColor(s.color);
    })();
  }, [name, mode, suggest, suggestion]);

  // palette da mostrare
  let colorOptions: string[] = [];

  if (mode === "create" || mode === "edit") {
    colorOptions = BASE_COLORS.map((base) => base);
  }

  if (mode === "create-sub" && parentColor) {
    // TODO: create shades of parent color
    colorOptions = BASE_COLORS.map((base) => base);
  }

  return {
    icons: CATEGORY_ICONS,
    colorOptions,
    selectedIcon,
    setSelectedIcon,
    selectedColor,
    setSelectedColor,
  };
}
