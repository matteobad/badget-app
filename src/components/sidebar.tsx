import Link from "next/link";
import { HandCoinsIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Menu } from "./menu";
import { SidebarToggle } from "./sidebar-toggle";
import { Button } from "./ui/button";

export function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 h-screen -translate-x-full transition-[width] duration-300 ease-in-out lg:translate-x-0",
        isOpen === false ? "w-[90px]" : "w-72",
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="relative flex h-full flex-col overflow-y-auto p-3 shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            "mb-1 transition-transform duration-300 ease-in-out",
            isOpen === false ? "translate-x-1" : "translate-x-0",
          )}
          variant="link"
          asChild
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <HandCoinsIcon className="mr-1 h-6 w-6" />
            <h1
              className={cn(
                "whitespace-nowrap text-lg font-bold transition-[transform,opacity,display] duration-300 ease-in-out",
                isOpen === false
                  ? "hidden -translate-x-96 opacity-0"
                  : "translate-x-0 opacity-100",
              )}
            >
              Badget.
            </h1>
          </Link>
        </Button>
        <Menu isOpen={isOpen} />
      </div>
    </aside>
  );
}
