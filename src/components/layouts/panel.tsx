"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

const PANEL_COOKIE_NAME = "panel:state";
const PANEL_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const PANEL_WIDTH = "24rem";
const PANEL_KEYBOARD_SHORTCUT = "b";

type PanelContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  togglePanel: () => void;
};

const PanelContext = React.createContext<PanelContext | null>(null);

function usePanel() {
  const context = React.useContext(PanelContext);
  if (!context) {
    throw new Error("usePanel must be used within a PanelProvider.");
  }

  return context;
}

const PanelProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile();

    // This is the internal state of the panel.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }

        // This sets the cookie to keep the panel state.
        document.cookie = `${PANEL_COOKIE_NAME}=${openState}; path=/; max-age=${PANEL_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open],
    );

    // Helper to toggle the panel.
    const togglePanel = React.useCallback(() => {
      return setOpen((open) => !open);
    }, [setOpen]);

    // Adds a keyboard shortcut to toggle the panel.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === PANEL_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault();
          togglePanel();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [togglePanel]);

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the panel with Tailwind classes.
    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo<PanelContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        togglePanel,
      }),
      [state, open, setOpen, isMobile, togglePanel],
    );

    return (
      <PanelContext.Provider value={contextValue}>
        <div
          className={cn(
            "group/panel-wrapper has-[[data-variant=inset]]:bg-panel flex min-h-svh w-full",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </PanelContext.Provider>
    );
  },
);
PanelProvider.displayName = "PanelProvider";

const Panel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    side?: "left" | "right";
    variant?: "panel" | "floating" | "inset";
    title: string;
    description?: string;
  }
>(
  (
    {
      side = "right",
      variant = "panel",
      title,
      description,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { isMobile, open, setOpen } = usePanel();

    if (isMobile) {
      return (
        <Drawer open={open} onOpenChange={setOpen} data-mobile="true">
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
            <div
              className={cn("flex h-full w-full flex-col py-6", className)}
            ></div>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Sheet open={open} onOpenChange={setOpen} {...props}>
        <SheetContent
          data-panel="panel"
          className="w-[--panel-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--panel-width": PANEL_WIDTH,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div
            className={cn("flex h-full w-full flex-col py-6", className)}
          ></div>
        </SheetContent>
      </Sheet>
    );
  },
);
Panel.displayName = "Panel";

const PanelTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { togglePanel } = usePanel();

  return (
    <Button
      ref={ref}
      data-panel="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event);
        togglePanel();
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Panel</span>
    </Button>
  );
});
PanelTrigger.displayName = "PanelTrigger";

const PanelHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-panel="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
});
PanelHeader.displayName = "PanelHeader";

const PanelFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-panel="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
});
PanelFooter.displayName = "PanelFooter";

const PanelSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-panel="separator"
      className={cn("bg-panel-border mx-2 w-auto", className)}
      {...props}
    />
  );
});
PanelSeparator.displayName = "PanelSeparator";

const PanelContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-panel="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
});
PanelContent.displayName = "PanelContent";

export {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
  PanelProvider,
  PanelSeparator,
  PanelTrigger,
  usePanel,
};
