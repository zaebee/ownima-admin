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
    return "bg-emerald-500 text-white border-transparent"
  }
  
  // 1, 9, 10: CONFIRMATION / CONFIRMATION_BY_RIDER / CONFIRMATION_BY_OWNER
  if (val === 1 || val === 9 || val === 10 || s.includes("CONFIRMATION")) {
    return "bg-sky-500 text-white border-transparent"
  }

  // 6: CANCELLED
  if (val === 6 || s.includes("CANCEL")) {
    return "bg-rose-500 text-white border-transparent"
  }

  // 3: COLLECTED
  if (val === 3 || s.includes("COLLECTED")) {
    return "bg-violet-500 text-white border-transparent"
  }

  // 5: COMPLETED
  if (val === 5 || s.includes("COMPLETED")) {
    return "bg-slate-500 text-white border-transparent"
  }

  // 7, 8, 11: OVERDUE, CONFLICT, NO_RESPONSE
  if (val === 7 || val === 8 || val === 11 || s.includes("OVERDUE") || s.includes("CONFLICT") || s.includes("NO RESPONSE") || s.includes("NO_RESPONSE")) {
    return "bg-amber-500 text-white border-transparent"
  }

  // 4: MAINTENANCE
  if (val === 4 || s.includes("MAINTENANCE")) {
    return "bg-stone-500 text-white border-transparent"
  }

  // 0: PENDING
  if (val === 0 || s.includes("PENDING")) {
    return "bg-blue-500 text-white border-transparent"
  }

  // fallback (12: UNSPECIFIED, or any other)
  return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-transparent"
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
