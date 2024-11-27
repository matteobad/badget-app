import { headers } from "next/headers";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

export async function DynamicBreadcrumb() {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path")!;
  const segments = pathname.split("/").slice(1);

  const isLastSegment = (index: number) => {
    return index === segments.length - 1;
  };

  const segnmentUrl = (segment: string) => {
    return pathname.substring(0, pathname.indexOf(segment) + segment.length);
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, idx) => {
          return isLastSegment(idx) ? (
            <BreadcrumbItem key={idx} className="capitalize">
              <BreadcrumbPage>{segment}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem className="hidden capitalize md:block" key={idx}>
                <BreadcrumbLink asChild>
                  <Link href={segnmentUrl(segment)}>{segment}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator
                className="hidden md:block"
                key={`${idx}-separator`}
              />
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
