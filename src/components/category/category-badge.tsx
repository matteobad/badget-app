import type { IconName } from "lucide-react/dynamic";
import { DynamicIcon } from "lucide-react/dynamic";

import { Badge } from "../ui/badge";

// Function to parse color string (supports both RGB and hex formats)
function parseColor(color: string): [number, number, number] {
  // Handle hex format
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
  }

  // Handle RGB format
  const rgbValues = color
    .replace(/rgb$$|$$/g, "")
    .split(",")
    .map((val) => Number.parseInt(val.trim()));
  return [rgbValues[0] ?? 0, rgbValues[1] ?? 0, rgbValues[2] ?? 0];
}

// Function to calculate luminance for contrast calculation
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!;
}

// Function to generate background and text colors with proper contrast
function generateColors(baseColor: string) {
  const [r, g, b] = parseColor(baseColor);

  // Create a light background version (15% opacity)
  const backgroundColor = `rgba(${r}, ${g}, ${b}, 0.15)`;

  // Create a border color (25% opacity for subtle border)
  const borderColor = `rgba(${r}, ${g}, ${b}, 0.25)`;

  // Calculate luminance to determine if we need light or dark text
  const luminance = getLuminance(r, g, b);

  // If the base color is light, use a darker version for text
  // If the base color is dark, use the base color or slightly lighter
  let color: string;
  if (luminance > 0.5) {
    // Light base color - use darker text
    const darkerR = Math.max(0, Math.floor(r * 0.6));
    const darkerG = Math.max(0, Math.floor(g * 0.6));
    const darkerB = Math.max(0, Math.floor(b * 0.6));
    color = `rgb(${darkerR}, ${darkerG}, ${darkerB})`;
  } else {
    // Dark base color - use the original color or slightly adjusted
    color = `rgb(${r}, ${g}, ${b})`;
  }

  return { backgroundColor, color, borderColor };
}

type CategoryBadgeProps = {
  category: {
    color: string | null;
    icon: string | null;
    name: string;
  };
};

export function CategoryBadge(props: CategoryBadgeProps) {
  const { category } = props;
  const { backgroundColor, color, borderColor } = generateColors(
    category.color ?? "",
  );
  const icon = (category.icon ?? "circle-dashed") as IconName;

  return (
    <Badge variant="category" style={{ backgroundColor, color, borderColor }}>
      <DynamicIcon name={icon} />
      <span>{category.name}</span>
    </Badge>
  );
}
