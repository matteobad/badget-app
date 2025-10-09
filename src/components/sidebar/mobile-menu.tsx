"use client";

import { MenuIcon, RocketIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "../ui/button";
import { Sheet, SheetContent } from "../ui/sheet";
import { MainMenu } from "./main-menu";

export function MobileMenu() {
  const [isOpen, setOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          className="relative flex h-8 w-8 items-center rounded-full md:hidden"
        >
          <MenuIcon size={16} />
        </Button>
      </div>
      <SheetContent side="left" className="-ml-2 rounded-none border-none">
        <div className="mb-8 ml-2">
          <RocketIcon />
        </div>

        <div className="-ml-2">
          <MainMenu onSelect={() => setOpen(false)} isExpanded={true} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
