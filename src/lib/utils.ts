import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
