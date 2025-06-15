import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { GaugeIcon } from "lucide-react";

const ThemeToggle = dynamic(() => import("~/components/theme-toggle"), {
  ssr: false,
  loading: () => (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1 px-2 text-lg font-semibold md:text-base"
    >
      <div className="h-6 w-6 animate-pulse rounded-full bg-muted-foreground/70" />
      <span className="w-14 animate-pulse rounded bg-muted-foreground/70 capitalize">
        &nbsp;
      </span>
    </Button>
  ),
});

export function SiteFooter(props: { className?: string }) {
  return (
    <footer className={cn("container border-t", props.className)}>
      <div className="my-2 grid grid-cols-2 grid-rows-2 items-center justify-between md:grid-cols-[1fr_auto_1fr] md:grid-rows-1">
        <Link href="/" className="col-start-1 flex items-center gap-2 md:mr-2">
          <GaugeIcon className="h-6 w-6" />
          <p className="text-lg font-medium">Badget.</p>
        </Link>
        <p className="col-span-2 row-start-2 text-center text-sm leading-loose text-muted-foreground md:col-span-1 md:col-start-2 md:row-start-1">
          Built by{" "}
          <a
            href="https://github.com/matteobadini"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Matteo Badini
          </a>
          . The source code is available on{" "}
          <a
            href="https://github.com/matteobad"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
        <div className="flex h-12 items-center justify-end">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
