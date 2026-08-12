import { clsx, type ClassValue } from "clsx";

/** Small classname combinator — wraps clsx so components can pass conditionals cleanly. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
