import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const CategoryFilters = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          Current
        </Button>
        <div className="flex items-center sm:gap-2">
          <Button variant="ghost" size="icon" className="size-9">
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-9">
            <ChevronRightIcon />
          </Button>
        </div>
        <div className="text-sm font-semibold whitespace-nowrap sm:text-lg md:text-xl">
          Marzo 2025
        </div>
      </div>
      <div className="flex w-full items-center justify-end gap-2">
        <Select defaultValue="month">
          <SelectTrigger className="h-9 w-auto gap-1.5">
            <SelectValue placeholder="Mensile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Settimanale</SelectItem>
            <SelectItem value="biweek">Bisettimanale</SelectItem>
            <SelectItem value="month">Mensile</SelectItem>
            <SelectItem value="year">Annuale</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm">
          <PlusIcon className="size-4" />
          Crea
        </Button>
      </div>
    </div>
  );
};
