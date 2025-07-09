"use client";

import { DateRangePicker } from "../custom/date-range-picker";

export const CategoryFilters = () => {
  return (
    <div className="flex items-center gap-2 px-4">
      <DateRangePicker />
    </div>
  );
};
