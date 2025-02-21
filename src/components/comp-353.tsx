import type { LucideIcon } from "lucide-react";
import {
  CalendarClockIcon,
  CandlestickChartIcon,
  ChevronDownIcon,
  CircleDashedIcon,
  GaugeIcon,
  LayersIcon,
  PartyPopperIcon,
  PiggyBankIcon,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";

const items = [
  {
    id: "1",
    title: "Liquidità",
    icon: LayersIcon,
    collapsibles: [
      {
        title: "Spese fisse",
        content:
          "We optimize every component for maximum performance and minimal bundle size.",
        icon: GaugeIcon,
      },
      {
        title: "Fun money",
        content:
          "Our documentation is comprehensive and includes live examples for every component.",
        icon: PartyPopperIcon,
      },
    ],
  },
  {
    id: "2",
    title: "Fondo di mergenza",
    icon: PiggyBankIcon,
    collapsibles: [
      {
        title: "Can I use custom themes?",
        content:
          "Yes, our theming system is fully customizable and supports both light and dark modes.",
        icon: GaugeIcon,
      },
      {
        title: "What about Tailwind support?",
        content:
          "We have first-class support for Tailwind CSS with custom utility classes.",
        icon: CircleDashedIcon,
      },
    ],
  },
  {
    id: "3",
    title: "Spese previste",
    icon: CalendarClockIcon,
    collapsibles: [
      {
        title: "What's the bundle size impact?",
        content:
          "Our components are tree-shakeable and typically add minimal overhead to your bundle.",
        open: true,
        icon: GaugeIcon,
      },
      {
        title: "How is code splitting handled?",
        content:
          "We support automatic code splitting for optimal loading performance.",
        icon: CircleDashedIcon,
      },
    ],
  },
  {
    id: "4",
    title: "Investimenti",
    icon: CandlestickChartIcon,
    collapsibles: [
      {
        title: "Which screen readers are supported?",
        content:
          "We test with NVDA, VoiceOver, and JAWS to ensure broad compatibility.",
        icon: GaugeIcon,
      },
      {
        title: "What about keyboard navigation?",
        content:
          "Full keyboard navigation support is implemented following WAI-ARIA best practices.",
        icon: CircleDashedIcon,
      },
    ],
  },
];

export default function Component() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Multi-level w/ icon</h2>
      <Accordion type="multiple" className="w-full" defaultValue={["1"]}>
        {items.map((item) => (
          <AccordionItem value={item.id} key={item.id}>
            <AccordionTrigger className="justify-between gap-3 text-[15px] leading-6 hover:no-underline">
              <span className="flex items-center gap-3">
                <item.icon
                  size={16}
                  className="shrink-0 opacity-60"
                  aria-hidden="true"
                />
                <span>{item.title}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              {item.collapsibles.map((collapsible, index) => (
                <CollapsibleDemo
                  key={index}
                  title={collapsible.title}
                  content={collapsible.content}
                  open={collapsible.open}
                  icon={collapsible.icon}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function CollapsibleDemo({
  title,
  content,
  open,
  icon: Icon,
}: {
  title: string;
  content: string;
  open?: boolean;
  icon: LucideIcon;
}) {
  return (
    <Collapsible className="border-t py-3 ps-6 pe-4" defaultOpen={open}>
      <CollapsibleTrigger className="flex gap-2 text-[15px] leading-6 font-semibold [&[data-state=open]>svg]:rotate-180">
        <ChevronDownIcon
          size={16}
          className="mt-1 shrink-0 opacity-60 transition-transform duration-200"
          aria-hidden="true"
        />
        <span className="flex items-center gap-3">
          <Icon size={16} className="shrink-0 opacity-60" aria-hidden="true" />
          <span>{title}</span>
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down mt-1 overflow-hidden ps-6 text-sm text-muted-foreground transition-all">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );
}
