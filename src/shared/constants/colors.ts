// Define available colors with their Tailwind classes and hex values
export const AVAILABLE_COLORS = {
  slate: { name: "Slate", class: "bg-slate-300", hex: "#cbd5e1" },
  gray: { name: "Gray", class: "bg-gray-300", hex: "#d1d5db" },
  zinc: { name: "Zinc", class: "bg-zinc-300", hex: "#d4d4d8" },
  neutral: { name: "Neutral", class: "bg-neutral-300", hex: "#d4d4d4" },
  stone: { name: "Stone", class: "bg-stone-300", hex: "#d6d3d1" },
  red: { name: "Red", class: "bg-red-300", hex: "#fca5a5" },
  orange: { name: "Orange", class: "bg-orange-300", hex: "#fdba74" },
  amber: { name: "Amber", class: "bg-amber-300", hex: "#fcd34d" },
  yellow: { name: "Yellow", class: "bg-yellow-300", hex: "#fde047" },
  lime: { name: "Lime", class: "bg-lime-300", hex: "#bef264" },
  green: { name: "Green", class: "bg-green-300", hex: "#86efac" },
  emerald: { name: "Emerald", class: "bg-emerald-300", hex: "#6ee7b7" },
  teal: { name: "Teal", class: "bg-teal-300", hex: "#5eead4" },
  cyan: { name: "Cyan", class: "bg-cyan-300", hex: "#67e8f9" },
  sky: { name: "Sky", class: "bg-sky-300", hex: "#7dd3fc" },
  blue: { name: "Blue", class: "bg-blue-300", hex: "#93c5fd" },
  indigo: { name: "Indigo", class: "bg-indigo-300", hex: "#a5b4fc" },
  violet: { name: "Violet", class: "bg-violet-300", hex: "#c4b5fd" },
  purple: { name: "Purple", class: "bg-purple-300", hex: "#d8b4fe" },
  fuchsia: { name: "Fuchsia", class: "bg-fuchsia-300", hex: "#f0abfc" },
  pink: { name: "Pink", class: "bg-pink-300", hex: "#f9a8d4" },
  rose: { name: "Rose", class: "bg-rose-300", hex: "#fda4af" },
} as const;

export type ColorKey = keyof typeof AVAILABLE_COLORS;
