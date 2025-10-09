import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useChatInterface() {
  const pathname = usePathname();

  // Initialize state immediately from pathname to avoid blink on refresh
  const getInitialChatId = () => {
    const segments = pathname.split("/").filter(Boolean);
    // Possibili strutture:
    // - /overview → nessun chatId
    // - /overview/[chatId]
    // - /[locale]/overview → nessun chatId
    // - /[locale]/overview/[chatId]
    const overviewIndex = segments.indexOf("overview");
    if (overviewIndex !== -1 && segments.length > overviewIndex + 1) {
      return segments[overviewIndex + 1] ?? null;
    }
    return null;
  };

  const [chatId, setChatIdState] = useState<string | null>(getInitialChatId);

  // Extract chatId from pathname
  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const overviewIndex = segments.indexOf("overview");
    const potentialChatId =
      overviewIndex !== -1 && segments.length > overviewIndex + 1
        ? segments[overviewIndex + 1]
        : null;
    setChatIdState(potentialChatId ?? null);
  }, [pathname]);

  // Listen to popstate events for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const segments = window.location.pathname.split("/").filter(Boolean);
      const overviewIndex = segments.indexOf("overview");
      const potentialChatId =
        overviewIndex !== -1 && segments.length > overviewIndex + 1
          ? segments[overviewIndex + 1]
          : null;
      setChatIdState(potentialChatId ?? null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const isHome = !chatId;
  const isChatPage = Boolean(chatId);

  const setChatId = (id: string) => {
    // Preserve the locale in the URL
    const segments = pathname.split("/").filter(Boolean);
    const hasLocale = segments.length > 0 && segments[0] !== "overview"; // primo segmento è locale
    const locale = hasLocale ? segments[0] : null;

    const newPath = locale ? `/${locale}/overview/${id}` : `/overview/${id}`;

    window.history.pushState({}, "", newPath);
    setChatIdState(id);
  };

  return {
    isHome,
    isChatPage,
    chatId,
    setChatId,
  };
}
