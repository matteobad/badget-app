import type { BaseColor } from "~/shared/constants/category";
import { useCallback } from "react";
import { google } from "@ai-sdk/google";
import { BASE_COLORS, CATEGORY_SUGGESTIONS } from "~/shared/constants/category";
import { generateObject } from "ai";
import Fuse from "fuse.js";
import { iconNames } from "lucide-react/dynamic";
import z from "zod";

const fuse = new Fuse(CATEGORY_SUGGESTIONS, {
  keys: ["keywords"],
  threshold: 0.3,
});

export interface SuggestionResult {
  icon: string | null; // name del set
  color: BaseColor | null;
}

export function useCategorySuggestion() {
  const suggest = useCallback(
    async (input: string): Promise<SuggestionResult> => {
      if (!input.trim()) return { icon: null, color: null };
      console.debug("looking for category suggestion for", { input });

      // 1. tenta match locale
      console.debug("trying semantic category suggestion...");
      const results = fuse.search(input.toLowerCase());
      if (results.length > 0) {
        const match = results[0]!.item;
        console.debug("found semantic match", { match });
        return {
          icon: match.icon.displayName?.toLowerCase() ?? "Utensils",
          color: match.color,
        };
      }

      // 2. fallback LLM
      try {
        console.debug("trying LLM category suggestion...");
        const { object } = await generateObject({
          model: google("gemini-2.5-flash-lite"),
          prompt: `Suggerisci una icona Lucide e un colore base tailwind per una categoria di finanza personale chiamata "${input}".`,
          schema: z.object({
            color: z.enum(BASE_COLORS),
            icon: z.enum(iconNames),
          }),
        });

        console.debug("got LLM response", { object });
        return {
          icon: object.icon ?? null,
          color: object.color ?? null,
        };
      } catch (e) {
        console.error("AI suggestion failed:", e);
        return { icon: null, color: null };
      }
    },
    [],
  );

  return { suggest };
}
