"use client";

import { BaseCanvas } from "./base/base-canvas";

export function ProfitAnalysisCanvas() {
  return (
    <BaseCanvas>
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Profit Analysis
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detailed profit margin and profitability analysis
              </p>
            </div>
          </div>
        </div>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-gray-400 dark:text-gray-600">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Profit analysis data will appear here
            </p>
          </div>
        </div>
      </div>
    </BaseCanvas>
  );
}
