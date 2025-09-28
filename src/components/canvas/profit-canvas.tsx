"use client";

import { generateSampleData, ProfitChart } from "../charts";
import { BaseCanvas } from "./base/base-canvas";

export function ProfitCanvas() {
  const profitData = generateSampleData.profit();

  return (
    <BaseCanvas>
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Profit & Loss Analysis
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monthly profit trends with expense comparison
          </p>
        </div>
        <div className="h-96">
          <ProfitChart data={profitData} showAnimation={true} />
        </div>
      </div>
    </BaseCanvas>
  );
}
