import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { UserCheck } from "lucide-react"

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { impersonatedUser, stopImpersonating } = useAuth()

  return (
    <div className="flex h-screen w-full bg-muted/20 overflow-hidden flex-col">
      {/* Impersonation Banner */}
      {impersonatedUser && (
        <div className="bg-amber-600 dark:bg-amber-700 text-amber-50 px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between shadow-md relative z-[100] animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-amber-100 shrink-0" />
            <span>
              Impersonation Mode active: viewing as <strong className="underline">{impersonatedUser.email}</strong>. Actions performed will execute in this context.
            </span>
          </div>
          <button 
            onClick={stopImpersonating}
            className="bg-amber-800 hover:bg-amber-900 text-amber-50 px-3 py-1 rounded border border-amber-500/30 font-semibold uppercase text-[10px] tracking-wider transition-colors ml-4 shrink-0"
          >
            Leave Context
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden w-full relative">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Wrapper */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isSidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        )}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden w-full lg:w-[calc(100%-16rem)]">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
