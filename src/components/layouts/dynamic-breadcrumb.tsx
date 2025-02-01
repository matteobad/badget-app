"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type locale from "~/locales/it";
import { useScopedI18n } from "~/locales/client";
import { locales } from "~/locales/config";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const tScoped = useScopedI18n("breadcrumb");

  const isLastSegment = (index: number) => {
    return index === segments.length - 1;
  };

  const segnmentUrl = (segment: string) => {
    return pathname.substring(0, pathname.indexOf(segment) + segment.length);
  };

  return (
    <Breadcrumb className="flex-grow">
      <BreadcrumbList>
        {segments
          .filter((segment) => !locales.includes(segment))
          .map((segment, idx) => {
            const label = tScoped(segment as keyof typeof locale.breadcrumb);

            return isLastSegment(idx) ? (
              <BreadcrumbItem key={idx} className="capitalize">
                <BreadcrumbPage>{label}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <React.Fragment key={idx}>
                <BreadcrumbItem
                  className="hidden capitalize md:block"
                  key={idx}
                >
                  <BreadcrumbLink asChild>
                    <Link href={segnmentUrl(segment)}>{label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator
                  className="hidden md:block"
                  key={`${idx}-separator`}
                />
              </React.Fragment>
            );
          })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
