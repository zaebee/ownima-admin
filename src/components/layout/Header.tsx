import { Bell, Search, LogOut, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { getMediaUrl } from "@/lib/utils"
import { ThemeToggle } from "@/components/ThemeToggle"
import { GlobalSearch } from "@/components/GlobalSearch"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { logout, user } = useAuth()

  // Генерируем fallback по имени или email'у
  const initial = user?.full_name 
    ? user.full_name.charAt(0).toUpperCase() 
    : user?.email?.charAt(0).toUpperCase() || "A"

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex items-center lg:hidden">
        <button 
          type="button" 
          className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground"
          onClick={onMenuClick}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 gap-x-4 self-stretch justify-between lg:gap-x-6 ml-2 lg:ml-0">
        <div className="relative flex flex-1 items-center max-w-md">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-x-2 lg:gap-x-4 shrink-0">
          <ThemeToggle />
          <button type="button" className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="flex items-center gap-x-2">
              <Avatar className="h-8 w-8">
                {user?.avatar && <AvatarImage src={getMediaUrl(user.avatar)} alt={user.full_name || ""} />}
                <AvatarFallback className="bg-primary text-primary-foreground">{initial}</AvatarFallback>
              </Avatar>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-2 text-sm font-semibold leading-6 text-foreground max-w-[150px] truncate" aria-hidden="true">
                  {user?.full_name || user?.email || "Loading..."}
                </span>
              </span>
            </div>

            {/* Separator */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

            <button 
              onClick={logout}
              className="flex items-center gap-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:block">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
