import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalItems: number
  currentItemsCount: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  currentItemsCount,
  onPageChange,
  disabled = false,
}: PaginationControlsProps) {
  return (
    <div className="px-6 py-4 border-t bg-muted/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
      <div>
        Showing <span className="font-medium text-foreground">{currentItemsCount}</span> of <span className="font-medium text-foreground">{totalItems}</span> entries
      </div>
      <div className="flex gap-2 items-center">
        <span className="mr-4 text-xs font-medium">Page {currentPage} of {totalPages || 1}</span>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || disabled}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages || disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || disabled}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
