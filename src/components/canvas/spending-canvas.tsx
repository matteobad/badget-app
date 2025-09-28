"use client";

import { BaseCanvas } from "./base/base-canvas";

export function SpendingCanvas() {
  return (
    <BaseCanvas>
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Spending Overview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Comprehensive spending patterns and trends
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Spending data will appear here
            </p>
          </div>
        </div>
      </div>
    </BaseCanvas>
  );
}
