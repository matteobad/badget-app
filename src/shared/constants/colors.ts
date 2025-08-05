// Define available colors with their Tailwind classes and hex values
export const DEFAULT_COLORS = [
  { name: "Gray", value: "#6B7280" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Green", value: "#10B981" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Red", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" },
  { name: "Purple", value: "#8B5CF6" },
] as const;

export type ColorKey = keyof typeof DEFAULT_COLORS;
