"use client";

import { useState } from "react";

import { SiteFooter } from "~/app/_components/footer";
import { TopbarNav } from "~/app/_components/topbar-nav";
import { cn } from "~/lib/utils";
import { Sidebar } from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={cn(
          "min-h-screen transition-[margin-left] duration-300 ease-in-out",
          isOpen === false ? "lg:ml-[90px]" : "lg:ml-72",
        )}
      >
        <TopbarNav />
        {children}
      </main>
      <footer
        className={cn(
          "transition-[margin-left] duration-300 ease-in-out",
          isOpen === false ? "lg:ml-[90px]" : "lg:ml-72",
        )}
      >
        <SiteFooter />
      </footer>
    </>
  );
}
