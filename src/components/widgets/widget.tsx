import * as React from "react";
import { cn } from "~/lib/utils";
import { SettingsIcon } from "lucide-react";

import { Button } from "../ui/button";

type WidgetSettings = {
  period?: string;
  type?: string;
};

type WidgetContextProps = {
  state: "view" | "edit";
  open: boolean;
  setOpen: (open: boolean) => void;
  openSettings: () => void;
  saveSettings: () => void;
};

const WidgetContext = React.createContext<WidgetContextProps | null>(null);

function useWidget() {
  const context = React.useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider.");
  }

  return context;
}

function WidgetProvider({
  defaultOpen = false,
  open: openProp,
  onOpenChange: setOpenProp,
  onSettingsChange: setSettingsProp,
  children,
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSettingsChange?: () => void;
}) {
  // This is the internal state of the sidebar.
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
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const openSettings = React.useCallback(() => {
    setOpen(() => true);
  }, [setOpen]);

  // Helper to save widget settings.
  const saveSettings = React.useCallback(() => {
    setSettingsProp?.();
  }, [setSettingsProp]);

  // Adds a keyboard shortcut to open the widget settings.
  // React.useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (
  //       event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
  //       (event.metaKey || event.ctrlKey)
  //     ) {
  //       event.preventDefault();
  //       openSettings();
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, [openSettings]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "edit" : "view";

  const contextValue = React.useMemo<WidgetContextProps>(
    () => ({
      state,
      open,
      setOpen,
      openSettings,
      saveSettings,
    }),
    [state, open, setOpen, saveSettings],
  );

  return (
    <WidgetContext.Provider value={contextValue}>
      {children}
    </WidgetContext.Provider>
  );
}

function Widget({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { state } = useWidget();
  return (
    <div data-state={state} data-slot="widget" className="group">
      <div
        data-slot="widget-container"
        className={cn(
          "group flex h-full min-h-44 w-full flex-col gap-1 border bg-card py-4 text-card-foreground transition-colors",
          "group-data-[state=view]:hover:cursor-pointer group-data-[state=view]:hover:border-accent-foreground/20 group-data-[state=view]:hover:bg-accent/40",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

function WidgetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-header"
      className={cn(
        "@container/widget-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-3 px-4 has-data-[slot=widget-settings-trigger]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function WidgetTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open } = useWidget();

  return (
    <div
      data-slot="widget-title"
      className={cn(
        "h-4 text-xs leading-none text-muted-foreground",
        className,
      )}
      {...props}
    >
      {open ? "Settings" : children}
    </div>
  );
}

function WidgetDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-description"
      className={cn(
        "text-sm text-muted-foreground group-data-[state=edit]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function WidgetAction({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, saveSettings } = useWidget();

  return (
    <div
      data-slot="widget-action"
      className={cn(
        "flex w-full text-xs text-muted-foreground/60 transition-colors",
        "group-hover:group-data-[state=view]:text-accent-foreground", // action accent on widget hover
        "group-data-[state=edit]:hover:text-accent-foreground", // in edit mode accent save button on hover
        "group-data-[state=edit]:justify-end", // in edit mode align save button on the right
        className,
      )}
      {...props}
    >
      {open ? (
        <button type="button" onClick={saveSettings}>
          Save
        </button>
      ) : (
        children
      )}
    </div>
  );
}

function WidgetContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-content"
      className={cn(
        "block flex-1 px-4 pb-1",
        "group-data-[state=edit]:hidden", // di default tutti nascosti in edit
        className,
      )}
      {...props}
    />
  );
}

function WidgetSettings({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-settings"
      className={cn(
        "hidden flex-1 px-4",
        "group-data-[state=edit]:flex",
        className,
      )}
      {...props}
    />
  );
}

function WidgetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-footer"
      className={cn("flex items-center px-4 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

function WidgetSettingsTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { openSettings } = useWidget();

  return (
    <Button
      data-widget="settings-trigger"
      data-slot="widget-settings-trigger"
      variant="ghost"
      size="icon"
      className={cn(
        "col-start-2 row-span-2 row-start-1 size-4 self-start justify-self-end opacity-0 group-hover:opacity-100",
        "group-data-[state=edit]:hidden",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        openSettings();
      }}
      {...props}
    >
      <SettingsIcon />
      <span className="sr-only">Open settings</span>
    </Button>
  );
}

export {
  Widget,
  WidgetHeader,
  WidgetFooter,
  WidgetTitle,
  WidgetAction,
  WidgetDescription,
  WidgetContent,
  WidgetSettings,
  WidgetSettingsTrigger,
  WidgetProvider,
  useWidget,
};
