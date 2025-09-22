// import { NotificationCenter } from "@/components/notification-center";
// import { Trial } from "@/components/trial";
import { ConnectionStatus } from "../bank-connection/connection-status";
import { NavUser } from "../nav-user";
import { OpenSearchButton } from "../search/open-search-button";
import { MobileMenu } from "../sidebar/mobile-menu";

export function Header() {
  return (
    <header className="desktop:sticky desktop:top-0 desktop:bg-background bg-opacity-70 desktop:rounded-t-[10px] sticky top-0 z-50 flex h-[70px] items-center justify-between bg-[#fff] px-6 backdrop-blur-xl backdrop-filter md:static md:m-0 md:border-b md:backdrop-blur-none md:backdrop-filter dark:bg-[#121212]">
      <MobileMenu />

      <OpenSearchButton />

      <div className="ml-auto flex space-x-2">
        {/* <Trial /> */}
        <ConnectionStatus />
        {/* <NotificationCenter /> */}
        <NavUser />
      </div>
    </header>
  );
}
