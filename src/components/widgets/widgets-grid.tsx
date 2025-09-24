"use client";

import { IncomeWidget } from "./income/income-widget";

export function WidgetsGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Insights */}
      <div className="col-span-1 h-44 border p-6" />

      {/* Net worth analysis */}
      <IncomeWidget />

      {/* Income this month */}
      <div className="col-span-1 h-44 border p-6" />

      {/* Expenses this month */}
      <div className="col-span-1 h-44 border p-6" />

      {/* Category breakdown */}
      <div className="col-span-1 h-44 border p-6" />

      {/* Tag breakdown */}
      <div className="col-span-1 h-44 border p-6" />

      {/* Forecast */}
      <div className="col-span-1 h-44 border p-6" />

      {/* Savings rate */}
      <div className="col-span-1 h-44 border p-6" />
    </div>
  );
}
