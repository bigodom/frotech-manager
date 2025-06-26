import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const dateToISO = (date: string) => {
  return new Date(date).toISOString();
}

export const formatDate = (dateString : string | Date): string => {
  const [data] = dateString.toString().split('T') // Get the date part only;
  const [year, month, day] = data.split('-');
  return `${day}/${month}/${year}`;
};