import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getReservationStatusColor(statusNum?: number | string | null, humanizedStatus?: string | null) {
  const s = (humanizedStatus || "").toUpperCase()
  const val = typeof statusNum === 'number' ? statusNum : -1

  if (s.includes("CONFIRM") || val === 1 || val === 2 || val === 9 || val === 10) {
    return "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
  }
  if (s.includes("CANCEL") || val === 6) {
    return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
  }
  if (s.includes("COLLECTED") || val === 3) {
    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
  }
  if (s.includes("COMPLETED") || val === 5) {
    return "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
  }
  if (s.includes("OVERDUE") || val === 7 || s.includes("NO RESPONSE") || val === 11 || s.includes("CONFLICT") || val === 8) {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
  }
  if (s.includes("MAINTENANCE") || val === 4) {
    return "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border border-stone-300 dark:border-stone-700"
  }
  if (s.includes("PENDING") || val === 0) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
  }

  // fallback
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
}


export function getMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  // Если путь уже является полноценным URL
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  
  try {
    // Получаем базовый URL из API URL (например вырезаем https://stage.ownima.com из https://stage.ownima.com/api/v1)
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
    const origin = new URL(apiUrl).origin;
    return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  } catch (e) {
    // Фолбек на случай проблем
    return `https://stage.ownima.com${path.startsWith("/") ? path : `/${path}`}`;
  }
}
