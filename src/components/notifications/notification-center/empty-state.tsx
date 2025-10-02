import { InboxIcon } from "lucide-react";

interface EmptyStateProps {
  description: string;
}

export function EmptyState({ description }: EmptyStateProps) {
  return (
    <div className="flex h-[460px] flex-col items-center justify-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
        <InboxIcon className="h-[18px] w-[18px]" />
      </div>
      <p className="text-sm text-[#606060]">{description}</p>
    </div>
  );
}
