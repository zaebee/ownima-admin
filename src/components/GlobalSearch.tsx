import { useState, useEffect } from "react"
import { Command } from "cmdk"
import * as Dialog from "@radix-ui/react-dialog"
import { Search, User, Car, CalendarDays, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useNavigate } from "react-router-dom"

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    owners: any[],
    riders: any[],
  }>({ owners: [], riders: [] })

  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (!query) {
      setResults({ owners: [], riders: [] })
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const [ownersRes, ridersRes] = await Promise.all([
          api.get('/admin/users', { params: { search: query, limit: 5 } }).catch(() => ({ data: { data: [] } })),
          api.get('/admin/riders', { params: { search: query, limit: 5 } }).catch(() => ({ data: { data: [] } }))
        ])

        setResults({
          owners: ownersRes.data?.data || [],
          riders: ridersRes.data?.data || [],
        })
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }, 400) // Debounce

    return () => clearTimeout(timer)
  }, [query])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-transparent hover:border-border rounded-md transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search anything...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl border bg-background shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <Command className="flex flex-col w-full h-full">
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Command.Input 
                  value={query}
                  onValueChange={setQuery}
                  className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Type a command or search..." 
                />
                {isLoading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
              </div>
              
              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                {!isLoading && query.length > 0 && results.owners.length === 0 && results.riders.length === 0 && (
                  <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                    No results found for "{query}".
                  </Command.Empty>
                )}
                {!isLoading && query.length === 0 && (
                   <div className="py-6 text-center text-sm text-muted-foreground">
                    Start typing to search users...
                   </div>
                )}

                {results.owners.length > 0 && (
                  <Command.Group heading="Owners" className="text-xs font-medium text-muted-foreground p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:font-semibold">
                    {results.owners.map((user) => (
                      <Command.Item 
                        key={`owner-${user.id}`}
                        onSelect={() => runCommand(() => navigate(`/owners/${user.id}`))}
                        className="flex items-center gap-2 px-2 py-2 mt-1 rounded-sm text-sm text-foreground hover:bg-muted aria-selected:bg-muted aria-selected:text-accent-foreground cursor-pointer"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{user.full_name || "Unnamed"}</span>
                        <span className="text-muted-foreground text-xs ml-2">{user.email}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {results.riders.length > 0 && (
                  <Command.Group heading="Riders" className="text-xs font-medium text-muted-foreground p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:font-semibold">
                    {results.riders.map((user) => (
                      <Command.Item 
                        key={`rider-${user.id}`}
                        onSelect={() => runCommand(() => navigate(`/riders/${user.id}`))}
                        className="flex items-center gap-2 px-2 py-2 mt-1 rounded-sm text-sm text-foreground hover:bg-muted aria-selected:bg-muted aria-selected:text-accent-foreground cursor-pointer"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{user.full_name || "Unnamed"}</span>
                        <span className="text-muted-foreground text-xs ml-2">{user.email}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
