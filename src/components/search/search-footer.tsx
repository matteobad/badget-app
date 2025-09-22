import {
  ArrowDownIcon,
  ArrowUpIcon,
  CornerDownLeftIcon,
  RocketIcon,
} from "lucide-react";

export function SearchFooter() {
  return (
    <div className="search-footer flex h-[40px] w-full items-center border border-t-[0px] border-border bg-background px-3 backdrop-blur-lg backdrop-filter">
      <div className="dark:opacity-50">
        <RocketIcon className="size-4" />
      </div>

      <div className="ml-auto flex space-x-2">
        <div className="flex size-6 items-center justify-center border bg-accent select-none">
          <ArrowUpIcon className="size-3" />
        </div>

        <div className="flex size-6 items-center justify-center border bg-accent select-none">
          <ArrowDownIcon className="size-3" />
        </div>

        <div className="flex size-6 items-center justify-center border bg-accent select-none">
          <CornerDownLeftIcon className="size-3" />
        </div>
      </div>
    </div>
  );
}
