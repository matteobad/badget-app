import type { IconName } from "lucide-react/dynamic";
import { DynamicIcon } from "lucide-react/dynamic";

import { Badge } from "../ui/badge";

type CategoryBadgeProps = {
  category: {
    color: string | null;
    icon: string | null;
    name: string;
  };
};

export function CategoryBadge(props: CategoryBadgeProps) {
  const { category } = props;
  const icon = (category.icon ?? "circle-dashed") as IconName;

  const backgroundColor = `color-mix(in oklab, ${category.color} 10%, transparent)`;
  const borderColor = `color-mix(in oklab, ${category.color} 10%, transparent)`;
  const color = `category.color`;

  return (
    <Badge variant="category" style={{ backgroundColor, color, borderColor }}>
      <DynamicIcon name={icon} />
      <span>{category.name}</span>
    </Badge>
  );
}
