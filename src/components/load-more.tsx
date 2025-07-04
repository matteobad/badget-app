"use client";

import type { ForwardedRef, SVGProps } from "react";
import { cn } from "~/lib/utils";

export function LoadMore({
  hasNextPage,
  ref,
}: {
  hasNextPage: boolean;
  ref: ForwardedRef<HTMLDivElement>;
}) {
  if (!hasNextPage) return null;

  return (
    <div className="mt-6 flex items-center justify-center" ref={ref}>
      <div className="flex items-center space-x-2 py-5">
        <Spinner />
        <span className="text-sm text-[#606060]">Loading more...</span>
      </div>
    </div>
  );
}

interface SpinnerProps
  extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  /**
   * The size of the spinner in pixels.
   * @default 20
   */
  size?: number;
}

export const Spinner = ({
  className,
  size = 20,
  style,
  ...props
}: SpinnerProps) => {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("animate-spin stroke-[#878787]", className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <path d="M12 3v3m6.366-.366-2.12 2.12M21 12h-3m.366 6.366-2.12-2.12M12 21v-3m-6.366.366 2.12-2.12M3 12h3m-.366-6.366 2.12 2.12" />
    </svg>
  );
};
