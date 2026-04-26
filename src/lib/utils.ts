import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getReservationStatusColor(statusNum?: number | string | null, humanizedStatus?: string | null) {
  const s = String(humanizedStatus || "").toUpperCase()
  const val = typeof statusNum === 'number' ? statusNum : -1

  // 2: CONFIRMED
  if (val === 2 || s === "CONFIRMED" || s === "RESERVATION_CONFIRMED") {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
  }
  
  // 1, 9, 10: CONFIRMATION / CONFIRMATION_BY_RIDER / CONFIRMATION_BY_OWNER
  if (val === 1 || val === 9 || val === 10 || s.includes("CONFIRMATION")) {
    return "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-400 border border-sky-200 dark:border-sky-800"
  }

  // 6: CANCELLED
  if (val === 6 || s.includes("CANCEL")) {
    return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
  }

  // 3: COLLECTED
  if (val === 3 || s.includes("COLLECTED")) {
    return "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-400 border border-violet-200 dark:border-violet-800"
  }

  // 5: COMPLETED
  if (val === 5 || s.includes("COMPLETED")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
  }

  // 7, 8, 11: OVERDUE, CONFLICT, NO_RESPONSE
  if (val === 7 || val === 8 || val === 11 || s.includes("OVERDUE") || s.includes("CONFLICT") || s.includes("NO RESPONSE") || s.includes("NO_RESPONSE")) {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
  }

  // 4: MAINTENANCE
  if (val === 4 || s.includes("MAINTENANCE")) {
    return "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border border-stone-300 dark:border-stone-700"
  }

  // 0: PENDING
  if (val === 0 || s.includes("PENDING")) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
  }

  // fallback (12: UNSPECIFIED, or any other)
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
