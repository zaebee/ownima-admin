import { Globe } from "lucide-react"
import { useTranslation } from "@/contexts/LanguageContext"

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation()

  return (
    <button
      onClick={() => setLanguage(language === "ru" ? "en" : "ru")}
      className="relative gap-1.5 px-2 inline-flex h-9 min-w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-transparent hover:border-border/60"
      aria-label="Toggle Language"
    >
      <Globe className="h-4 w-4 text-muted-foreground/80 hover:text-indigo-500 transition-colors" />
      <span className="text-[11px] font-mono font-bold tracking-wider uppercase leading-none mt-0.5">
        {language}
      </span>
      <span className="sr-only">Toggle language</span>
    </button>
  )
}
