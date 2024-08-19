import Link from "next/link";

import AnimatedBackground from "~/components/custom/animated-background";
import { cn } from "~/lib/utils";

interface TopbarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SettingsTopbarNav({
  className,
  items,
  ...props
}: TopbarNavProps) {
  return (
    <nav className={cn("flex flex-row space-x-2 pt-1.5", className)} {...props}>
      <AnimatedBackground
        defaultValue={items[0]?.href}
        className="rounded-lg bg-slate-100 dark:bg-slate-800"
        transition={{
          type: "spring",
          bounce: 0.2,
          duration: 0.3,
        }}
        enableHover
      >
        {items.map((item, index) => (
          <Link
            key={index}
            data-id={item.href}
            href={item.href}
            type="button"
            className={cn(
              "p-2 py-0.5 text-slate-600 transition-colors duration-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50",
              { "underline underline-offset-[12px]": index === 0 },
            )}
          >
            {item.title}
          </Link>
        ))}
      </AnimatedBackground>
    </nav>
  );
}
