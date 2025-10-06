"use client";

import { useEffect, useState } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Link from "next/link";
import { ErrorFallback } from "~/components/error-fallback";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useNotifications } from "~/hooks/use-notifications";
import { BellDotIcon, SettingsIcon } from "lucide-react";

import { EmptyState } from "./empty-state";
import { NotificationItem } from "./notification-item";

export function NotificationCenter() {
  const [isOpen, setOpen] = useState(false);

  const {
    hasUnseenNotifications,
    notifications,
    archived,
    markMessageAsRead,
    markAllMessagesAsSeen,
    markAllMessagesAsRead,
    isLoading,
  } = useNotifications();

  const unreadNotifications = notifications; // Main notifications (unread/read)
  const archivedNotifications = archived; // Archived notifications

  useEffect(() => {
    if (isOpen && hasUnseenNotifications) {
      markAllMessagesAsSeen();
    }
  }, [hasUnseenNotifications, isOpen, markAllMessagesAsSeen]);

  return (
    <Popover onOpenChange={setOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative flex h-8 w-8 items-center shadow-none"
        >
          {hasUnseenNotifications && (
            <div className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-[#FFD02B]" />
          )}
          <BellDotIcon size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="relative h-[535px] w-screen overflow-hidden p-0 md:w-[400px]"
        align="end"
        sideOffset={10}
      >
        <ErrorBoundary errorComponent={ErrorFallback}>
          <Tabs defaultValue="inbox">
            <TabsList className="w-full justify-between rounded-none border-b-[1px] bg-transparent py-6">
              <div className="flex">
                <TabsTrigger value="inbox" className="border-0 font-normal">
                  Inbox
                </TabsTrigger>
                <TabsTrigger value="archive" className="font-normal">
                  Archive
                </TabsTrigger>
              </div>
              <Link
                href="/settings/notifications"
                onClick={() => setOpen(false)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-ransparent mr-2 h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-accent"
                >
                  <SettingsIcon size={16} />
                </Button>
              </Link>
            </TabsList>

            <TabsContent value="inbox" className="relative mt-0">
              {!isLoading && !unreadNotifications.length && (
                <EmptyState description="No new notifications" />
              )}

              {!isLoading && unreadNotifications.length > 0 && (
                <ScrollArea className="h-[485px] pb-12">
                  <div className="divide-y">
                    {unreadNotifications.map((notification) => {
                      return (
                        <NotificationItem
                          key={notification.id}
                          id={notification.id}
                          markMessageAsRead={markMessageAsRead}
                          setOpen={setOpen}
                          activity={notification}
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              {!isLoading && unreadNotifications.length > 0 && (
                <div className="absolute bottom-0 flex h-12 w-full items-center justify-center border-t-[1px]">
                  <Button
                    variant="secondary"
                    className="bg-transparent"
                    onClick={markAllMessagesAsRead}
                  >
                    Archive all
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="archive" className="mt-0">
              {!isLoading && !archivedNotifications.length && (
                <EmptyState description="Nothing in the archive" />
              )}

              {!isLoading && archivedNotifications.length > 0 && (
                <ScrollArea className="h-[490px]">
                  <div className="divide-y">
                    {archivedNotifications.map((notification) => {
                      return (
                        <NotificationItem
                          key={notification.id}
                          id={notification.id}
                          setOpen={setOpen}
                          activity={notification}
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </ErrorBoundary>
      </PopoverContent>
    </Popover>
  );
}
