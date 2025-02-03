"use client";

import { type Dispatch, type SetStateAction } from "react";
import { ArrowRight, Info } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Separator } from "../ui/separator";

interface DataMappingProps {
  file?: File;
  setFile: Dispatch<SetStateAction<File | undefined>>;
  onUpload: () => void;
}

export default function DataMapping(props: DataMappingProps) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex flex-col gap-4">
        <p className="text-muted-foreground">
          {
            "We've mapped each column to what we believe is correct, but please review the data below to confirm it's accurate."
          }
        </p>

        <div className="space-y-4">
          {/* Mapping Fields */}
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>

            <ArrowRight className="size-4 text-muted-foreground" />

            <div className="flex h-10 items-center justify-between gap-2 rounded border px-3">
              <span className="text-sm text-muted-foreground">Date</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Date format information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Description Field */}
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Description" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="description">Description</SelectItem>
              </SelectContent>
            </Select>

            <ArrowRight className="size-4 text-muted-foreground" />

            <div className="flex h-10 items-center justify-between gap-2 rounded border px-3">
              <span className="text-sm text-muted-foreground">Description</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Transaction description information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Amount Field */}
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>

            <ArrowRight className="size-4 text-muted-foreground" />

            <div className="flex h-10 items-center justify-between gap-2 rounded border px-3">
              <span className="text-sm text-muted-foreground">Amount</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Transaction amount information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Balance Field */}
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Balance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balance">Balance</SelectItem>
              </SelectContent>
            </Select>

            <ArrowRight className="size-4 text-muted-foreground" />

            <div className="flex h-10 items-center justify-between gap-2 rounded border px-3">
              <span className="text-sm text-muted-foreground">Balance</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Transaction balance information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <Accordion type="single" collapsible className="mb-6 w-full">
        {/* Account Section */}
        <AccordionItem value="account">
          <AccordionTrigger>Account</AccordionTrigger>
          <AccordionContent>
            <h4 className="mb-2 font-medium">Bank account</h4>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking Account</SelectItem>
                <SelectItem value="savings">Savings Account</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        {/* Settings Section */}
        <AccordionItem value="settings">
          <AccordionTrigger>Settings</AccordionTrigger>
          <AccordionContent>
            <h4 className="mb-2 font-medium">Inverted amount</h4>
            <div className="flex gap-2">
              <p className="mb-4 text-muted-foreground">
                If the transactions are from credit account, you can invert the
                amount.
              </p>
              <Switch />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-2">
        <Button className="w-full" onClick={props.onUpload}>
          Confirm import
        </Button>
        <Button
          variant="link"
          className="w-full"
          onClick={() => props.setFile(undefined)}
        >
          Choose another file
        </Button>
      </div>
    </div>
  );
}
