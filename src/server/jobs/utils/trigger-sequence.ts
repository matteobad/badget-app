import type { BatchRunHandle } from "@trigger.dev/sdk/v3";

interface TriggerTask<T> {
  batchTriggerAndWait: (
    items: { payload: T }[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
    options?: any & { delayMinutes?: number },
  ) => Promise<BatchRunHandle<string, T, void>>;
}

export async function triggerSequenceAndWait<T>(
  items: T[],
  task: TriggerTask<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
  options?: any & { delayMinutes?: number },
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { delayMinutes = 1, ...restOptions } = options ?? {};

  const batchItems = items.map((item, i) => ({
    payload: item,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    options: {
      ...restOptions,
      delay: `${i * delayMinutes}min`,
    },
  }));

  return task.batchTriggerAndWait(batchItems, restOptions);
}
