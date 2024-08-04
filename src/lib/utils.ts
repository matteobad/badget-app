import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const euroFormat = (value: number | bigint | string) =>
  Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(typeof value === "string" ? Number(value) : value);
