"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { useSpaceQuery } from "~/hooks/use-space";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

type Props = {
  isExpanded?: boolean;
};

export function OrganizationSwitcher({ isExpanded = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setActive] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: activeSpace } = useSpaceQuery();

  const changeSpaceMutation = useMutation(
    trpc.organization.setActive.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
      },
    }),
  );

  const { data: organizations } = useQuery(
    trpc.organization.list.queryOptions(),
  );

  const sortedOrganizations =
    organizations?.sort((a, b) => {
      if (a.id === activeSpace?.id) return -1;
      if (b.id === activeSpace?.id) return 1;

      return (a.id ?? "").localeCompare(b.id ?? "");
    }) ?? [];

  // @ts-expect-error bad types
  useOnClickOutside(ref, () => {
    if (!changeSpaceMutation.isPending) {
      setActive(false);
    }
  });

  const toggleActive = () => setActive((prev) => !prev);

  const handleOrgChange = (organizationId: string) => {
    if (organizationId === activeSpace?.id) {
      toggleActive();
      return;
    }

    setActive(false);

    changeSpaceMutation.mutate({
      organizationId,
    });
  };

  return (
    <div className="relative h-[32px]" ref={ref}>
      {/* Avatar - fixed position that absolutely never changes */}
      <div className="fixed bottom-4 left-[19px] h-[32px] w-[32px]">
        <div className="relative h-[32px] w-[32px]">
          <AnimatePresence>
            {isActive && (
              <motion.div
                className="absolute left-0 h-[32px] w-[32px] overflow-hidden"
                style={{ zIndex: 1 }}
                initial={{ y: 0, opacity: 0 }}
                animate={{
                  y: -(32 + 10) * sortedOrganizations.length,
                  opacity: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 1.2,
                }}
              >
                <Link href="/spaces/create" onClick={() => setActive(false)}>
                  <Button
                    className="h-[32px] w-[32px]"
                    size="icon"
                    variant="outline"
                  >
                    <PlusIcon />
                  </Button>
                </Link>
              </motion.div>
            )}
            {sortedOrganizations.map((org, index) => (
              <motion.div
                key={org.id}
                className="absolute left-0 h-[32px] w-[32px] overflow-hidden"
                style={{ zIndex: -index }}
                initial={{
                  scale: `${100 - index * 16}%`,
                  y: index * 5,
                }}
                animate={
                  isActive
                    ? {
                        y: -(32 + 10) * index,
                        scale: "100%",
                      }
                    : {
                        scale: `${100 - index * 16}%`,
                        y: index * 5,
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 1.2,
                }}
              >
                <Avatar
                  className="h-[32px] w-[32px] cursor-pointer rounded-none border border-[#DCDAD2] dark:border-[#2C2C2C]"
                  onClick={() => {
                    if (index === 0) {
                      toggleActive();
                    } else {
                      handleOrgChange(org.id ?? "");
                    }
                  }}
                >
                  <AvatarImage
                    src={org?.logo ?? ""}
                    alt={org?.name ?? ""}
                    width={20}
                    height={20}
                  />
                  <AvatarFallback className="h-[32px] w-[32px] rounded-none">
                    <span className="text-xs">
                      {org?.name?.charAt(0)?.toUpperCase()}
                      {org?.name?.charAt(1)?.toUpperCase()}
                    </span>
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Team name - appears to the right of the fixed avatar */}
      {isExpanded && sortedOrganizations[0] && (
        <div className="fixed bottom-4 left-[62px] flex h-[32px] items-center">
          <span
            className="cursor-pointer truncate text-sm text-primary transition-opacity duration-200 ease-in-out hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              toggleActive();
            }}
          >
            {sortedOrganizations[0].name}
          </span>
        </div>
      )}
    </div>
  );
}
