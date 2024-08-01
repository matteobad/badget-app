import Link from "next/link";
import { HandCoinsIcon } from "lucide-react";

import { UserNav } from "./user-nav";

export function TopbarNav() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center justify-between px-6">
        <Link
          href="/"
          className="relative z-20 flex items-center gap-3 text-xl font-bold tracking-tight"
        >
          <HandCoinsIcon />
          Badget.
        </Link>
        <div className="flex items-center">
          <UserNav />
        </div>
      </div>
    </nav>
  );
}
